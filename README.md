# AccessAI

Aplicação Nuxt 4 que executa uma auditoria de acessibilidade com Playwright e axe-core e oferece explicações opcionais via OpenAI Responses API.

## Configuração local

Requer Node.js e Chromium compatível com Playwright. Instale dependências com `pnpm install` e copie `.env.example` para `.env`. Defina `NUXT_AUDIT_ENABLED=true` somente para desenvolvimento local em servidor vinculado a loopback. Se quiser explicações por IA, configure `NUXT_OPENAI_API_KEY`; a auditoria axe-core continua disponível sem essa chave. O modelo pode ser alterado com `NUXT_OPENAI_MODEL`.

Inicie com `pnpm dev` e acesse `http://localhost:3000`.

## Endpoints

- `POST /api/audit` com `{ "url": "https://example.com" }` executa Playwright + axe-core.
- `POST /api/ai/analyze` com `{ "audit": <resultado> }` interpreta os problemas sem repetir a navegação.

## Segurança

O endpoint de auditoria permanece desativado por padrão (`NUXT_AUDIT_ENABLED=false`). A verificação de URL e os interceptores do Playwright bloqueiam protocolos e destinos privados, incluindo requisições secundárias, mas a validação DNS em aplicação não elimina por completo DNS rebinding. Antes de expor o serviço publicamente, implemente isolamento de saída no nível de rede para o processo/container do Chromium. A chave da OpenAI fica apenas no runtime privado do servidor.

As violações automáticas são evidências para revisão, não uma certificação de conformidade WCAG.
