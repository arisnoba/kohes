import type { PostgrestError } from "@supabase/supabase-js"

import { createSupabaseServerClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import type { SurveyData } from "@/components/survey/SurveyProvider"

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
    rewardNote: item.reward_note,
  }))

  return { responses, error: null }
}

export function isMissingTableError(error: PostgrestError | null): boolean {
  if (!error) return false
  return error.code === "42P01" // undefined_table
}

/**
 * PII(개인식별정보)와 응답 데이터를 분리하는 함수
 * PRD 8조: PII 분리 저장 원칙 준수
 */
export function separatePIIData(data: SurveyData) {
  // PII: 성명, 연락처(Tel, Mobile, Email), 주소
  const piiData = {
    name: data.basicInfo.name,
    tel: data.basicInfo.tel,
    mobile: data.basicInfo.mobile,
    email: data.basicInfo.email,
    address: data.basicInfo.address,
  }

  // 응답 데이터: PII를 제외한 모든 설문 응답
  const responseData = {
    basicInfo: {
      position: data.basicInfo.position,
    },
    expansionInfo: data.expansionInfo,
    projectDetails: data.projectDetails,
    policyNeeds: data.policyNeeds,
  }

  return { piiData, responseData }
}

/**
 * 설문 응답을 Supabase에 제출하는 함수 (클라이언트 사용)
 */
export async function submitSurveyResponse(data: SurveyData) {
  try {
    const response = await fetch("/api/survey/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ surveyData: data }),
    })

    if (!response.ok) {
      let errorMessage = response.statusText
      try {
        const errorBody = await response.json()
        if (errorBody?.error) {
          errorMessage = errorBody.error
        }
      } catch (parseError) {
        // 응답 본문이 JSON이 아닐 수 있으므로 무시
      }

      return { success: false, error: errorMessage, id: null }
    }

    const result = (await response.json()) as { success?: boolean; id?: string }
    return {
      success: Boolean(result.success),
      error: null,
      id: result.id ?? null,
    }
  } catch (error) {
    console.error("설문 제출 오류:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "설문 제출 중 오류가 발생했습니다",
      id: null,
    }
  }
}
