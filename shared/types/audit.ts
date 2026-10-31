export type Severity = 'critical' | 'serious' | 'moderate' | 'minor'

export interface AuditNode {
  html: string
  target: string[]
  failureSummary: string
}

export interface AuditIssue {
  id: string
  description: string
  help: string
  impact: Severity | null
  wcag: string[]
  helpUrl: string
  nodes: AuditNode[]
}

export interface AuditResult {
  url: string
  auditedAt: string
  status: 'completed'
  violationCount: number
  affectedNodeCount: number
  counts: Record<Severity, number>
  issues: AuditIssue[]
}
