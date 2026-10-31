import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import type { AuditIssue, AuditResult, Severity } from '../../shared/types/audit'
import { assertSafeUrl } from '../utils/url-security'

const severities: Severity[] = ['critical', 'serious', 'moderate', 'minor']

export async function auditPage(rawUrl: string): Promise<AuditResult> {
  const initial = await assertSafeUrl(rawUrl)
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  const context = await browser.newContext({
    javaScriptEnabled: true,
    serviceWorkers: 'block',
    acceptDownloads: false,
  })
  try {
    const page = await context.newPage()
    page.setDefaultNavigationTimeout(20_000)
    page.setDefaultTimeout(5_000)
    let redirects = 0
    await page.route('**/*', async (route) => {
      const requestUrl = route.request().url()
      if (!['http:', 'https:'].includes(new URL(requestUrl).protocol)) return route.abort()
      if (route.request().isNavigationRequest()) {
        redirects += 1
        if (redirects > 10) return route.abort()
        try { await assertSafeUrl(requestUrl) } catch { return route.abort() }
      }
      return route.continue()
    })
    const response = await page.goto(initial.href, { waitUntil: 'domcontentloaded' })
    if (!response) throw createError({ statusCode: 502, statusMessage: 'O site não respondeu à navegação.' })
    if (response.status() >= 400) throw createError({ statusCode: 502, statusMessage: `O site respondeu com erro HTTP ${response.status()}.` })
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()
    const issues: AuditIssue[] = results.violations.map((violation) => ({
      id: violation.id,
      description: violation.description,
      help: violation.help,
      impact: severities.includes(violation.impact as Severity) ? violation.impact as Severity : null,
      wcag: violation.tags.filter(tag => /^wcag\d/.test(tag)),
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map(node => ({ html: node.html, target: node.target, failureSummary: node.failureSummary ?? '' })),
    }))
    const counts = Object.fromEntries(severities.map(severity => [severity, issues.filter(issue => issue.impact === severity).length])) as Record<Severity, number>
    return { url: page.url(), auditedAt: new Date().toISOString(), status: 'completed', violationCount: issues.length, affectedNodeCount: issues.reduce((total, issue) => total + issue.nodes.length, 0), counts, issues }
  } finally {
    await context.close().catch(() => undefined)
    await browser.close()
  }
}
