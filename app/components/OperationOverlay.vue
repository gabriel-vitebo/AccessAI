<script setup lang="ts">
import type { OperationState } from '../../shared/types/audit'

const state = useOperationState()
const messages: Partial<Record<OperationState, string>> = {
  processing: 'Analisando a acessibilidade da página...',
  'analyzing-ai': 'Gerando recomendações com IA...',
}
const visible = computed(() => Boolean(messages[state.value]))
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[100] grid place-items-center bg-slate-950/80 p-5 backdrop-blur-sm" role="status" aria-live="polite" aria-atomic="true">
      <div class="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-7 text-center shadow-2xl">
        <span aria-hidden="true" class="mx-auto mb-5 block size-9 rounded-full border-2 border-teal-300/25 border-t-teal-300 motion-safe:animate-spin motion-reduce:animate-none" />
        <p class="font-medium text-white">{{ messages[state] }}</p>
        <p class="mt-2 text-sm text-slate-400">Isso pode levar alguns segundos.</p>
      </div>
    </div>
  </Teleport>
</template>
