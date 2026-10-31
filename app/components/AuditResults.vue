<script setup lang="ts">
import type { AiAnalysis, AuditResult, Severity } from '../../shared/types/audit'

const props = defineProps<{ result: AuditResult }>()
const aiLoading = ref(false)
const operation = useOperationState()
const aiError = ref('')
const analysis = ref<AiAnalysis | null>(null)
const byId = computed(() => new Map(analysis.value?.explanations.map(item => [item.id, item]) ?? []))
const labels: Record<Severity, string> = { critical: 'Críticos', serious: 'Graves', moderate: 'Moderados', minor: 'Leves' }
const tones: Record<Severity, string> = { critical: 'text-rose-300', serious: 'text-orange-300', moderate: 'text-amber-200', minor: 'text-sky-200' }

async function requestAnalysis() {
  if (aiLoading.value || operation.value === 'analyzing-ai') return
  aiLoading.value = true
  operation.value = 'analyzing-ai'
  aiError.value = ''
  analysis.value = null
  try { analysis.value = await $fetch<AiAnalysis>('/api/ai/analyze', { method: 'POST', body: { audit: props.result } }) }
  catch (error: unknown) {
    const data = (error as { data?: { statusMessage?: string } })?.data
    aiError.value = data?.statusMessage || 'Não foi possível obter as recomendações da IA.'
  } finally {
    aiLoading.value = false
    operation.value = 'completed'
  }
}
</script>

<template>
  <section aria-live="polite" class="mt-10 space-y-6">
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <div class="rounded-2xl border border-white/10 bg-slate-900 p-4"><p class="text-xs text-slate-400">Regras violadas</p><p class="mt-2 text-3xl font-semibold">{{ result.violationCount }}</p></div>
      <div v-for="severity in (['critical', 'serious', 'moderate', 'minor'] as Severity[])" :key="severity" class="rounded-2xl border border-white/10 bg-slate-900 p-4">
        <p class="text-xs text-slate-400">{{ labels[severity] }}</p><p class="mt-2 text-3xl font-semibold" :class="tones[severity]">{{ result.counts[severity] }}</p>
      </div>
    </div>
    <p class="text-sm text-slate-400">{{ result.affectedNodeCount }} elementos afetados · {{ new Date(result.auditedAt).toLocaleString('pt-BR') }}</p>
    <p v-if="result.networkFailureCount" class="text-xs text-slate-500">Durante o carregamento, {{ result.networkFailureCount }} requisição(ões) de recursos falharam. Isso não invalida automaticamente a auditoria.</p>
    <div class="flex flex-wrap items-center gap-3">
      <UButton color="primary" :loading="aiLoading" :disabled="aiLoading || !result.issues.length" @click="requestAnalysis">{{ aiLoading ? 'Interpretando resultados…' : 'Explicar problemas com IA' }}</UButton>
      <p v-if="aiLoading" role="status" class="text-sm text-slate-400">Preparando explicações e sugestões de correção.</p>
      <p v-if="aiError" role="alert" class="text-sm text-amber-200">{{ aiError }} Os resultados da auditoria continuam disponíveis.</p>
      <p v-if="analysis && !analysis.explanations.length" role="status" class="text-sm text-slate-300">Não há violações para explicar.</p>
    </div>
    <div v-if="!result.issues.length" class="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 text-emerald-100">Nenhuma violação foi encontrada nesta auditoria automatizada.</div>
    <div v-else class="space-y-3">
      <details v-for="issue in result.issues" :key="issue.id" class="group rounded-2xl border border-white/10 bg-slate-900 open:border-teal-300/30">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-5"><span><span class="font-medium">{{ issue.help }}</span><span class="mt-1 block text-xs text-slate-400">{{ issue.id }} · {{ issue.nodes.length }} elementos</span></span><span class="rounded-full bg-white/5 px-3 py-1 text-xs" :class="issue.impact ? tones[issue.impact] : 'text-slate-300'">{{ issue.impact ? labels[issue.impact] : 'Sem gravidade' }}</span></summary>
        <div class="space-y-4 border-t border-white/10 p-5 text-sm">
          <p class="text-slate-300">{{ issue.description }}</p>
          <div v-if="byId.get(issue.id)" class="space-y-3 rounded-xl border border-teal-300/20 bg-teal-300/5 p-4">
            <h3 class="font-medium text-teal-100">Entenda e corrija</h3>
            <p><strong class="text-slate-200">Em linguagem simples:</strong> {{ byId.get(issue.id)?.plainLanguage }}</p>
            <p><strong class="text-slate-200">Impacto para usuários:</strong> {{ byId.get(issue.id)?.userImpact }}</p>
            <p><strong class="text-slate-200">Sugestão:</strong> {{ byId.get(issue.id)?.recommendation }}</p>
            <pre v-if="byId.get(issue.id)?.exampleHtml" class="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-teal-100">{{ byId.get(issue.id)?.exampleHtml }}</pre>
          </div>
          <p class="text-xs text-slate-400">WCAG: {{ issue.wcag.join(', ') || 'sem referência identificada' }}</p>
          <div v-for="(node, index) in issue.nodes" :key="index" class="rounded-xl bg-slate-950 p-4">
            <code class="block break-all text-xs text-teal-100">{{ node.target.join(', ') }}</code><pre class="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-xs text-slate-400">{{ node.html }}</pre><p v-if="node.failureSummary" class="mt-2 text-xs text-slate-300">{{ node.failureSummary }}</p>
          </div>
          <a :href="issue.helpUrl" target="_blank" rel="noopener noreferrer" class="inline-flex text-teal-300 underline underline-offset-4">Documentação da regra<span class="sr-only"> (abre em nova aba)</span></a>
        </div>
      </details>
    </div>
    <p class="text-xs text-slate-500">A auditoria automatizada ajuda a encontrar barreiras, mas não comprova conformidade WCAG.</p>
  </section>
</template>
