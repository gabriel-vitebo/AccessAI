import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

function isPrivateIp(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^::ffff:/, '')
  if (normalized === '::1' || normalized === '::' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:') || normalized.startsWith('2001:db8:')) return true
  const parts = normalized.split('.').map(Number)
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false
  const [a, b] = parts
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
}

export async function assertSafeUrl(input: string | URL): Promise<URL> {
  let url: URL
  try { url = new URL(input) } catch { throw createError({ statusCode: 400, statusMessage: 'Informe uma URL válida.' }) }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw createError({ statusCode: 400, statusMessage: 'Use uma URL HTTP ou HTTPS sem credenciais.' })
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) throw createError({ statusCode: 400, statusMessage: 'Esse endereço não pode ser analisado.' })
  if (isIP(host)) {
    if (isPrivateIp(host)) throw createError({ statusCode: 400, statusMessage: 'Esse endereço não pode ser analisado.' })
  } else {
    let addresses
    try { addresses = await lookup(host, { all: true, verbatim: true }) } catch { throw createError({ statusCode: 400, statusMessage: 'Não foi possível localizar esse domínio.' }) }
    if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) throw createError({ statusCode: 400, statusMessage: 'Esse domínio aponta para um endereço não permitido.' })
  }
  return url
}
