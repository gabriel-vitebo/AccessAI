import { randomUUID } from 'node:crypto'
import type { AuditResult, Severity } from '../../../shared/types/audit'
import { explainAudit } from '../../services/ai-analysis'
import { enforceRateLimit } from '../../utils/rate-limit'

const severities: Severity[] = ['critical', 'serious', 'moderate', 'minor']

function isAuditResult(value: unknown): value is AuditResult {
  if (!value || typeof value !== 'object') return false
  const audit = value as Partial<AuditResult>
  return audit.status === 'completed'
    && typeof audit.url === 'string' && audit.url.length <= 2048
    && Array.isArray(audit.issues) && audit.issues.length <= 80
    && audit.issues.every(issue => issue && typeof issue.id === 'string' && issue.id.length <= 120
      && typeof issue.description === 'string' && typeof issue.help === 'string'
      && (issue.impact === null || severities.includes(issue.impact))
      && Array.isArray(issue.wcag) && Array.isArray(issue.nodes) && issue.nodes.length <= 100
      && issue.nodes.every(node => typeof node.html === 'string' && node.html.length <= 2000
        && Array.isArray(node.target) && node.target.length <= 20
        && typeof node.failureSummary === 'string' && node.failureSummary.length <= 3000))
}

export default defineEventHandler(async (event) => {
  const operationId = randomUUID()
  const startedAt = Date.now()
  enforceRateLimit(event, 'ai-analysis', 3, 60_000)
  const body = await readBody<{ audit?: unknown }>(event)
  if (JSON.stringify(body ?? {}).length > 100_000 || !isAuditResult(body?.audit)) {
    throw createError({ statusCode: 400, statusMessage: 'Resultados da auditoria inválidos ou muito grandes.' })
  }
  const config = useRuntimeConfig(event)
  if (!config.openaiApiKey) throw createError({ statusCode: 503, statusMessage: 'Análise por IA indisponível: configure NUXT_OPENAI_API_KEY no servidor.' })
  if (!body.audit.issues.length) return { explanations: [] }
  console.info(JSON.stringify({ operationId, event: 'ai-analysis', stage: 'processing', status: 'running' }))
  try {
    const result = await explainAudit(body.audit, String(config.openaiApiKey), String(config.openaiModel || 'gpt-4.1-mini'))
    console.info(JSON.stringify({ operationId, event: 'ai-analysis', stage: 'completed', status: 'success', durationMs: Date.now() - startedAt, explanationCount: result.explanations.length }))
    return result
  } catch (error) {
    console.error(JSON.stringify({ operationId, event: 'ai-analysis', stage: 'processing', status: 'failure', durationMs: Date.now() - startedAt, errorType: error instanceof Error ? error.name : 'UnknownError' }))
    throw createError({ statusCode: 502, statusMessage: 'A análise por IA falhou. Os resultados do axe-core continuam disponíveis.' })
  }
})
