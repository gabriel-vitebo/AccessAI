<script setup lang="ts">
import type { AuditResult } from '../shared/types/audit'

const url = ref('')
const loading = ref(false)
const error = ref('')
const result = ref<AuditResult | null>(null)

async function analyze() {
  loading.value = true
  error.value = ''
  result.value = null
  try {
    result.value = await $fetch<AuditResult>('/api/audit', { method: 'POST', body: { url: url.value.trim() } })
  } catch (cause: unknown) {
    const data = (cause as { data?: { statusMessage?: string; message?: string } })?.data
    error.value = data?.statusMessage || data?.message || 'Não foi possível analisar este site. Verifique o endereço e tente novamente.'
  } finally {
    loading.value = false
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
        <form class="mt-9 rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-left shadow-2xl shadow-black/30 sm:flex sm:items-center sm:gap-3" @submit.prevent="analyze">
          <label class="sr-only" for="url">URL do site para analisar</label>
          <input id="url" v-model="url" type="url" inputmode="url" autocomplete="url" required placeholder="https://seusite.com.br" class="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500">
          <button type="submit" :disabled="loading" class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-wait disabled:opacity-60 sm:mt-0 sm:w-auto">
            <span v-if="loading" aria-hidden="true" class="size-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
            {{ loading ? 'Analisando…' : 'Analisar acessibilidade' }}
          </button>
        </form>
        <p v-if="loading" role="status" class="mt-4 text-sm text-slate-400">Abrindo o site e verificando barreiras. Isso pode levar alguns segundos.</p>
        <p v-if="error" role="alert" class="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-left text-sm text-rose-200">{{ error }}</p>
      </section>
      <AuditResults v-if="result" :result="result" />
      <footer class="mt-20 text-center text-xs text-slate-600">AccessAI · Auditoria automatizada com axe-core</footer>
    </div>
  </main>
</template>
