import { chromium, type Browser, type BrowserContext } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import type { AuditIssue, AuditResult, Severity } from '../../shared/types/audit'
import { assertSafeUrl } from '../utils/url-security'

const severities: Severity[] = ['critical', 'serious', 'moderate', 'minor']
let activeAudits = 0

export async function auditPage(rawUrl: string, operationId: string, onStage: (stage: string) => void): Promise<AuditResult> {
  if (activeAudits >= 2) throw createError({ statusCode: 429, statusMessage: 'O serviço está ocupado. Tente novamente em instantes.' })
  activeAudits += 1
  let browser: Browser | undefined
  let context: BrowserContext | undefined
  let networkFailureCount = 0
  const startedAt = Date.now()
  const log = (stage: string, status: 'running' | 'success' | 'failure', extra: Record<string, unknown> = {}) => {
    console.info(JSON.stringify({ operationId, event: 'audit', stage, status, durationMs: Date.now() - startedAt, networkFailureCount, ...extra }))
  }
  try {
    onStage('validating')
    const initial = await assertSafeUrl(rawUrl)
    log('validating', 'success')

    onStage('launching-browser')
    try { browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] }) }
    catch { throw createError({ statusCode: 503, statusMessage: 'O navegador de auditoria não está disponível.' }) }
    context = await browser.newContext({ javaScriptEnabled: true, serviceWorkers: 'block', acceptDownloads: false })
    const page = await context.newPage()
    page.setDefaultNavigationTimeout(20_000)
    page.setDefaultTimeout(8_000)
    page.on('requestfailed', () => { networkFailureCount += 1 })

    let navigationCount = 0
    await page.route('**/*', async (route) => {
      let requestUrl: URL
      try { requestUrl = new URL(route.request().url()) } catch { return route.abort() }
      if (!['http:', 'https:'].includes(requestUrl.protocol)) return route.abort()
      try { await assertSafeUrl(requestUrl) } catch { return route.abort() }
      if (route.request().isNavigationRequest()) {
        navigationCount += 1
        if (navigationCount > 10) return route.abort()
      }
      return route.continue()
    })

    onStage('navigating')
    const response = await page.goto(initial.href, { waitUntil: 'domcontentloaded', timeout: 20_000 }).catch((error: unknown) => {
      if (error instanceof Error && error.name === 'TimeoutError') throw createError({ statusCode: 504, statusMessage: 'O site demorou demais para responder.' })
      throw createError({ statusCode: 502, statusMessage: 'Não foi possível acessar o site informado.' })
    })
    if (!response) throw createError({ statusCode: 502, statusMessage: 'O site não respondeu à navegação.' })
    if (response.status() >= 400) throw createError({ statusCode: 502, statusMessage: `O site respondeu com erro HTTP ${response.status()}.` })
    log('navigating', 'success')

    onStage('auditing')
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()
    onStage('processing')
    const issues: AuditIssue[] = results.violations.map(violation => ({
      id: violation.id,
      description: violation.description,
      help: violation.help,
      impact: severities.includes(violation.impact as Severity) ? violation.impact as Severity : null,
      wcag: violation.tags.filter(tag => /^wcag\d/.test(tag)),
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map(node => ({ html: node.html, target: node.target, failureSummary: node.failureSummary ?? '' })),
    }))
    const counts = Object.fromEntries(severities.map(severity => [severity, issues.filter(issue => issue.impact === severity).length])) as Record<Severity, number>
    const result: AuditResult = {
      url: page.url(), auditedAt: new Date().toISOString(), status: 'completed', violationCount: issues.length,
      affectedNodeCount: issues.reduce((total, issue) => total + issue.nodes.length, 0), networkFailureCount, counts, issues,
    }
    log('completed', 'success', { violationCount: result.violationCount, affectedNodeCount: result.affectedNodeCount })
    return result
  } catch (error) {
    log('audit', 'failure', { errorType: error instanceof Error ? error.name : 'UnknownError' })
    throw error
  } finally {
    await context?.close().catch(() => undefined)
    await browser?.close().catch(() => undefined)
    activeAudits -= 1
  }
}
