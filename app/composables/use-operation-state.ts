import type { OperationState } from '../../shared/types/audit'

export function useOperationState() {
  return useState<OperationState>('accessai-operation-state', () => 'idle')
}
