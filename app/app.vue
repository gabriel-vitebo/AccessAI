<script setup lang="ts">
import type { AuditResult } from '../shared/types/audit'

const url = ref('')
const operation = useOperationState()
const inFlight = ref(false)
const loading = computed(() => inFlight.value)
const error = ref('')
const result = ref<AuditResult | null>(null)
const completed = ref(false)

async function analyze() {
  if (inFlight.value || operation.value === 'analyzing-ai') return
  inFlight.value = true
  operation.value = 'validating'
  error.value = ''
  result.value = null
  completed.value = false
  try {
    const parsed = new URL(url.value.trim())
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('URL inválida')
    operation.value = 'processing'
    result.value = await $fetch<AuditResult>('/api/audit', { method: 'POST', body: { url: url.value.trim() } })
    completed.value = true
    operation.value = 'completed'
  } catch (cause: unknown) {
    operation.value = 'error'
    const failure = cause as { statusCode?: number; status?: number; data?: { statusCode?: number; statusMessage?: string }; name?: string }
    const status = failure.data?.statusCode ?? failure.statusCode ?? failure.status
    const message = failure.data?.statusMessage ?? ''
    if ((cause instanceof Error && cause.message === 'URL inválida') || message.includes('URL válida')) error.value = 'Informe uma URL válida começando com http:// ou https://.'
    else if (status === 429) error.value = 'Muitas análises foram solicitadas. Aguarde um pouco e tente novamente.'
    else if (message.includes('não pode ser analisado') || message.includes('endereço não permitido')) error.value = 'Por segurança, esse endereço não pode ser analisado.'
    else if (message.includes('isolamento de rede')) error.value = 'A auditoria está desativada neste servidor até que o isolamento de rede seja configurado.'
    else if (message.includes('navegador de auditoria')) error.value = 'O navegador de auditoria está indisponível neste momento. Tente novamente mais tarde.'
    else if (failure.name === 'TimeoutError' || message.toLowerCase().includes('timeout')) error.value = 'A página demorou demais para responder. Verifique a URL e tente novamente.'
    else if (status === 502 || status === 503) error.value = 'Não foi possível acessar o site informado. Verifique a URL e tente novamente.'
    else error.value = 'Não conseguimos concluir a análise de acessibilidade. Tente novamente.'
  } finally {
    inFlight.value = false
    if (operation.value === 'validating' || operation.value === 'processing') operation.value = result.value ? 'completed' : 'idle'
  }
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-14 text-white sm:px-8">
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(20,184,166,0.17),transparent_68%)]" />
    <div class="relative mx-auto max-w-5xl">
      <header class="mb-14 flex items-center gap-3">
        <div class="grid size-10 place-items-center rounded-xl bg-teal-300 font-bold text-slate-950">A</div>
        <span class="text-lg font-semibold tracking-tight">Access<span class="text-teal-300">AI</span></span>
      </header>
      <section class="mx-auto max-w-3xl text-center">
        <p class="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Acessibilidade para todos</p>
        <h1 class="text-4xl font-semibold tracking-tight sm:text-6xl">Uma web mais acessível<br class="hidden sm:block"> começa com uma análise.</h1>
        <p class="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400">Descubra barreiras de acessibilidade na sua página e encontre caminhos para corrigi-las.</p>
        <form class="mt-9 rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-left shadow-2xl shadow-black/30 sm:flex sm:items-center sm:gap-3" :aria-busy="loading" @submit.prevent="analyze">
          <label class="sr-only" for="url">URL do site para analisar</label>
          <input id="url" v-model="url" type="url" inputmode="url" autocomplete="url" required placeholder="https://seusite.com.br" class="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500">
          <button type="submit" :disabled="loading || operation === 'analyzing-ai'" class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-wait disabled:opacity-60 sm:mt-0 sm:w-auto">
            <span v-if="loading" aria-hidden="true" class="size-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
            {{ loading ? 'Analisando…' : 'Analisar acessibilidade' }}
          </button>
        </form>
        <p v-if="completed" role="status" aria-live="polite" class="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-left text-sm text-emerald-200">Auditoria concluída!</p>
        <p v-if="error" role="alert" class="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-left text-sm text-rose-200">{{ error }}</p>
      </section>
      <AuditResults v-if="result" :result="result" />
      <footer class="mt-20 text-center text-xs text-slate-600">AccessAI · Auditoria automatizada com axe-core</footer>
    </div>
    <OperationOverlay />
  </main>
</template>
