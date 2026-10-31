const windows = new Map<string, { startedAt: number; count: number }>()

export function enforceRateLimit(event: { node: { req: { socket: { remoteAddress?: string } } } }, name: string, limit: number, windowMs: number) {
  const now = Date.now()
  const key = `${name}:${event.node.req.socket.remoteAddress ?? 'unknown'}`
  const current = windows.get(key)
  if (!current || now - current.startedAt >= windowMs) windows.set(key, { startedAt: now, count: 1 })
  else if (++current.count > limit) throw createError({ statusCode: 429, statusMessage: 'Muitas solicitações. Aguarde um pouco e tente novamente.' })
}
