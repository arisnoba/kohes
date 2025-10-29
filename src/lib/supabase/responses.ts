import type { PostgrestError } from "@supabase/supabase-js"

import { createSupabaseClient, createSupabaseServerClient } from "@/lib/supabase/client"
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
function separatePIIData(data: SurveyData) {
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
  const supabase = createSupabaseClient()

  // PII 데이터와 응답 데이터 분리
  const { piiData, responseData } = separatePIIData(data)

  // 응답자 이름과 소속 추출 (대시보드 표시용)
  const respondentName = data.basicInfo.name || null
  const organizationName =
    data.expansionInfo.medicalOrgName || data.expansionInfo.companyName || null

  // 데이터베이스에 저장 (JSON 형식으로 변환)
  const { data: insertedData, error } = await supabase
    .from("survey_responses")
    .insert({
      respondent_name: respondentName,
      organization_name: organizationName,
      response_data: JSON.parse(JSON.stringify(responseData)),
      pii_data: JSON.parse(JSON.stringify(piiData)),
      is_completed: true,
      reward_status: "발송 대기",
    })
    .select("id")
    .single()

  if (error) {
    console.error("설문 제출 오류:", error)
    return { success: false, error: error.message, id: null }
  }

  return { success: true, error: null, id: insertedData.id }
}
