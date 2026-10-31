import { auditPage } from '../services/audit'
import { assertSafeUrl } from '../utils/url-security'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ url?: unknown }>(event)
  if (typeof body?.url !== 'string' || body.url.length > 2048) {
    throw createError({ statusCode: 400, statusMessage: 'Envie uma URL válida com até 2048 caracteres.' })
  }
  await assertSafeUrl(body.url)
  return auditPage(body.url)
})
