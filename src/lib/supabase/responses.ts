import type { PostgrestError } from "@supabase/supabase-js"

import { createSupabaseServerClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

export type RewardStatus = Database["public"]["Tables"]["survey_responses"]["Row"]["reward_status"]

export interface AdminResponseSummary {
  id: string
  respondentName: string | null
  organizationName: string | null
  rewardStatus: RewardStatus
  rewardSentAt: string | null
  submittedAt: string
  rewardNote: string | null
}

interface FetchResult {
  responses: AdminResponseSummary[]
  error: PostgrestError | null
}

export async function fetchSurveyResponses(limit = 200): Promise<FetchResult> {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from("survey_responses")
    .select(
      "id, respondent_name, organization_name, reward_status, reward_sent_at, submitted_at, reward_note"
    )
    .order("submitted_at", { ascending: false })
    .limit(limit)

  if (error) {
    return { responses: [], error }
  }

  const responses: AdminResponseSummary[] = (data ?? []).map((item) => ({
    id: item.id,
    respondentName: item.respondent_name,
    organizationName: item.organization_name,
    rewardStatus: item.reward_status,
    rewardSentAt: item.reward_sent_at,
    submittedAt: item.submitted_at,
    rewardNote: item.reward_note
  }))

  return { responses, error: null }
}

export function isMissingTableError(error: PostgrestError | null): boolean {
  if (!error) return false
  return error.code === "42P01" // undefined_table
}
