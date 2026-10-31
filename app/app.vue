<script setup lang="ts">
const pageUrl = ref('')
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5 py-12 text-white">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(20,184,166,0.18),transparent_52%)]" />

    <form class="relative w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-10" @submit.prevent>
      <label for="page-url" class="mb-3 block text-sm font-medium text-slate-200">cole o link aqui</label>
      <div class="flex flex-col gap-3 sm:flex-row">
        <input
          id="page-url"
          v-model="pageUrl"
          type="url"
          inputmode="url"
          autocomplete="url"
          placeholder="https://exemplo.com"
          class="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
        >
        <button
          type="submit"
          class="rounded-xl bg-teal-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
        >
          analisar
        </button>
      </div>
    </form>
  </main>
</template>
