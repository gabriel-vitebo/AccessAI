import { randomUUID } from 'node:crypto'
import { auditPage } from '../services/audit'
import { assertSafeUrl } from '../utils/url-security'
import { enforceRateLimit } from '../utils/rate-limit'

export default defineEventHandler(async (event) => {
  const operationId = randomUUID()
  const startedAt = Date.now()
  const config = useRuntimeConfig(event)
  if (config.auditEnabled !== true && config.auditEnabled !== 'true') {
    throw createError({ statusCode: 503, statusMessage: 'Auditorias estão desabilitadas até que o servidor tenha isolamento de rede para o navegador.' })
  }
  enforceRateLimit(event, 'audit', 5, 60_000)
  const body = await readBody<{ url?: unknown }>(event)
  if (typeof body?.url !== 'string' || body.url.length > 2048) {
    throw createError({ statusCode: 400, statusMessage: 'Envie uma URL válida com até 2048 caracteres.' })
  }
  try {
    await assertSafeUrl(body.url)
    return await auditPage(body.url, operationId, (stage) => {
      console.info(JSON.stringify({ operationId, event: 'audit', stage, status: 'running' }))
    })
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500
    const knownMessage = (error as { statusMessage?: string }).statusMessage
    console.error(JSON.stringify({ operationId, event: 'audit', stage: 'request', status: 'failure', durationMs: Date.now() - startedAt, statusCode }))
    if (statusCode < 500 && knownMessage) throw error
    throw createError({
      statusCode,
      statusMessage: statusCode === 429 ? 'Muitas análises em andamento. Tente novamente em instantes.'
        : statusCode === 504 ? 'A página demorou demais para responder. Tente novamente.'
          : statusCode === 503 ? 'O navegador de auditoria está temporariamente indisponível.'
            : 'Não conseguimos concluir a auditoria. Tente novamente.',
    })
  }
})
import { randomUUID } from 'node:crypto'
