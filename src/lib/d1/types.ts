export interface AdminResponseSummary {
  id: string
  respondentName: string | null
  organizationName: string | null
  submittedAt: string
  orgType: string | null
  expansionTiming: string | null
  responseData: Record<string, unknown> | null
  piiData: Record<string, unknown> | null
}

export interface SurveyResponseRecord {
  id: string
  submittedAt: string
  responseData: Record<string, unknown> | null
  piiData: Record<string, unknown> | null
}
