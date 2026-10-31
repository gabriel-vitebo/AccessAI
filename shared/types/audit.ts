export type Severity = 'critical' | 'serious' | 'moderate' | 'minor'
export type OperationState = 'idle' | 'validating' | 'navigating' | 'auditing' | 'processing' | 'analyzing-ai' | 'completed' | 'error'

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
  networkFailureCount: number
  counts: Record<Severity, number>
  issues: AuditIssue[]
}

export interface IssueExplanation {
  id: string
  plainLanguage: string
  userImpact: string
  recommendation: string
  exampleHtml: string
  priority: Severity | null
}

export interface AiAnalysis { explanations: IssueExplanation[] }
