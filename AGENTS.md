# AGENTS.md

## Objetivo

Este documento estabelece as diretrizes para agentes de IA que trabalham neste repositório.

O agente deve compreender o projeto antes de modificar qualquer código, preservar a arquitetura existente e priorizar soluções simples, seguras, testáveis e sustentáveis.

## 1. Análise inicial

Antes de implementar qualquer alteração:

1. Leia o `README.md` e a documentação disponível.
2. Analise a estrutura de diretórios e identifique a stack utilizada.
3. Consulte o `package.json`, scripts, configurações e dependências.
4. Identifique padrões de arquitetura, nomenclatura e organização.
5. Verifique se a funcionalidade solicitada já existe, integral ou parcialmente.
6. Identifique testes existentes e possíveis impactos da alteração.

Não presuma que uma funcionalidade está ausente sem investigar.

## 2. Desenvolvimento

- Utilize preferencialmente TypeScript quando a stack permitir.
- Respeite os padrões existentes no repositório.
- Priorize código legível, modular e reutilizável.
- Evite abstrações desnecessárias e complexidade prematura.
- Não duplique lógica que já possa ser reutilizada.
- Evite dependências adicionais quando houver uma solução adequada com as ferramentas existentes.
- Não altere funcionalidades fora do escopo solicitado.
- Preserve a compatibilidade com o comportamento atual, salvo quando a mudança for intencional.

## 3. Arquitetura

- Respeite a separação de responsabilidades.
- Mantenha componentes, serviços e utilitários organizados.
- Evite componentes excessivamente grandes.
- Prefira funções pequenas e com responsabilidades claras.
- Preserve contratos de APIs e interfaces existentes.
- Não introduza novos padrões arquiteturais sem necessidade comprovada.

## 4. Qualidade e testes

Após cada implementação:

1. Execute os testes relacionados à alteração, quando disponíveis.
2. Execute verificações de TypeScript e lint, quando configuradas.
3. Verifique possíveis regressões.
4. Teste os cenários principais e os casos de erro.
5. Corrija problemas introduzidos pela alteração.

Nunca afirme que testes foram executados se não foram.

## 5. Segurança

- Nunca exponha tokens, credenciais, senhas ou chaves privadas.
- Não inclua informações sensíveis no código-fonte.
- Utilize variáveis de ambiente quando necessário.
- Valide entradas externas.
- Evite executar comandos destrutivos sem autorização explícita.
- Não modifique arquivos `.env` com valores sensíveis sem necessidade e autorização.
- Não realize operações externas irreversíveis sem confirmação.

## 6. Dependências

- Utilize o gerenciador de pacotes já adotado pelo projeto.
- Preserve o arquivo de lock existente.
- Evite atualizar dependências sem relação com a tarefa.
- Priorize bibliotecas gratuitas, estáveis e com licenças compatíveis.
- Justifique a introdução de novas dependências.

## 7. Documentação

Atualize a documentação quando uma alteração afetar:

- Instalação ou configuração.
- Comandos de execução.
- Arquitetura.
- Variáveis de ambiente.
- APIs ou funcionalidades públicas.
- Fluxos importantes de utilização.

Não crie documentação redundante ou arquivos desnecessários.

## 8. Comunicação e execução

Antes de implementar mudanças complexas:

1. Explique brevemente o problema identificado.
2. Apresente um plano objetivo.
3. Identifique riscos ou dependências relevantes.
4. Execute a implementação.
5. Valide os resultados.

Para alterações simples, execute diretamente quando o escopo estiver claro.

Ao concluir, apresente:

- O que foi implementado.
- Quais arquivos foram alterados.
- Quais testes foram executados.
- Quais limitações permanecem.
- Quais próximos passos são recomendados, quando aplicável.

## 9. Restrições

- Não remova código funcional sem justificativa.
- Não sobrescreva alterações do usuário.
- Não realize refatorações extensas fora do escopo.
- Não invente resultados de testes, APIs ou comportamentos.
- Não adicione comentários óbvios ou desnecessários.
- Não altere configurações globais do sistema sem autorização.
- Não faça commits ou pushes automaticamente, salvo quando solicitado.

## 10. Prioridades

Em caso de conflito entre soluções, priorize:

1. Correção funcional.
2. Segurança e preservação de dados.
3. Compatibilidade com a arquitetura existente.
4. Simplicidade e legibilidade.
5. Testabilidade.
6. Desempenho.
7. Facilidade de manutenção.

## 11. Idioma

- Comunicação com o usuário: português brasileiro.
- Código, identificadores e nomes técnicos: seguir o padrão existente no projeto, preferencialmente inglês.
- Documentação: seguir o idioma predominante no repositório.
- Mensagens de erro e interfaces: respeitar o idioma definido pelo produto.

## Princípio fundamental

**Analise antes de modificar, reutilize antes de criar, valide antes de concluir e documente quando necessário.**