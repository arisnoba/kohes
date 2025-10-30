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
  totalCount: number
  error: PostgrestError | null
}

const PAGE_SIZE = 500

export async function fetchSurveyResponses(): Promise<FetchResult> {
  const { items, totalCount, error } = await fetchSurveyRows(
    "id, respondent_name, organization_name, reward_status, reward_sent_at, submitted_at, reward_note",
    (item) => ({
      id: item.id as string,
      respondentName: (item.respondent_name as string | null) ?? null,
      organizationName: (item.organization_name as string | null) ?? null,
      rewardStatus: item.reward_status as RewardStatus,
      rewardSentAt: (item.reward_sent_at as string | null) ?? null,
      submittedAt: item.submitted_at as string,
      rewardNote: (item.reward_note as string | null) ?? null,
    })
  )

  return { responses: items, totalCount, error }
}

export interface SurveyResponseRecord {
  id: string
  submittedAt: string
  responseData: Record<string, unknown> | null
  piiData: Record<string, unknown> | null
}

interface PayloadFetchResult {
  entries: SurveyResponseRecord[]
  totalCount: number
  error: PostgrestError | null
}

export async function fetchSurveyResponsePayloads(): Promise<PayloadFetchResult> {
  const { items, totalCount, error } = await fetchSurveyRows(
    "id, submitted_at, response_data, pii_data",
    (item) => ({
      id: item.id as string,
      submittedAt: item.submitted_at as string,
      responseData: (item.response_data as Record<string, unknown> | null) ?? null,
      piiData: (item.pii_data as Record<string, unknown> | null) ?? null,
    })
  )

  return { entries: items, totalCount, error }
}

interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  error: PostgrestError | null
}

async function fetchSurveyRows<T>(
  selectColumns: string,
  mapFn: (item: Record<string, unknown>) => T
): Promise<PaginatedResult<T>> {
  const supabase = createSupabaseServerClient()
  const rows: T[] = []
  let from = 0
  let totalCount = 0

  while (true) {
    const to = from + PAGE_SIZE - 1
    const { data, error, count } = await supabase
      .from("survey_responses")
      .select(selectColumns, from === 0 ? { count: "exact" } : undefined)
      .order("submitted_at", { ascending: false })
      .range(from, to)

    if (error) {
      return { items: [], totalCount: 0, error }
    }

    if (from === 0 && typeof count === "number") {
      totalCount = count
    }

    if (!data || data.length === 0) {
      break
    }

    rows.push(...data.map((item) => mapFn(item as unknown as Record<string, unknown>)))

    if (data.length < PAGE_SIZE) {
      break
    }

    from += PAGE_SIZE
  }

  if (totalCount === 0) {
    totalCount = rows.length
  }

  return { items: rows, totalCount, error: null }
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
