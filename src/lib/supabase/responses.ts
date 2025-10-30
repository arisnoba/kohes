import type { PostgrestError } from "@supabase/supabase-js"

import { createSupabaseServerClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import type { SurveyData } from "@/components/survey/SurveyProvider"

export type RewardStatus = Database["public"]["Tables"]["survey_responses"]["Row"]["reward_status"]

const DEFAULT_REWARD_STATUS: RewardStatus = "발송 대기"
const ADMIN_BASE_COLUMNS = "id, respondent_name, organization_name, submitted_at, response_data, pii_data"
const ADMIN_REWARD_COLUMNS = "reward_status, reward_sent_at, reward_note"
const ADMIN_PRIMARY_SELECT = `${ADMIN_BASE_COLUMNS}, ${ADMIN_REWARD_COLUMNS}`
const MISSING_COLUMN_CODE = "42703"

export interface AdminResponseSummary {
  id: string
  respondentName: string | null
  organizationName: string | null
  rewardStatus: RewardStatus
  rewardSentAt: string | null
  rewardNote: string | null
  submittedAt: string
  orgType: string | null
  expansionTiming: string | null
  responseData: Record<string, unknown> | null
  piiData: Record<string, unknown> | null
}

interface FetchResult {
  responses: AdminResponseSummary[]
  totalCount: number
  error: PostgrestError | null
}

const PAGE_SIZE = 500

export async function fetchSurveyResponses(): Promise<FetchResult> {
  const primary = await fetchSurveyRows(ADMIN_PRIMARY_SELECT, mapAdminResponseSummary)

  if (primary.error) {
    if (isMissingColumnError(primary.error)) {
      const fallback = await fetchSurveyRows(ADMIN_BASE_COLUMNS, mapAdminResponseSummary)
      return { responses: fallback.items, totalCount: fallback.totalCount, error: fallback.error }
    }

    return { responses: [], totalCount: 0, error: primary.error }
  }

  return { responses: primary.items, totalCount: primary.totalCount, error: null }
}

interface PaginatedAdminResponseResult extends FetchResult {
  page: number
  pageSize: number
}

export async function fetchSurveyResponsesPage({
  page = 1,
  pageSize = 20,
}: {
  page?: number
  pageSize?: number
} = {}): Promise<PaginatedAdminResponseResult> {
  const normalizedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const normalizedPageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), PAGE_SIZE) : 20
  const from = (normalizedPage - 1) * normalizedPageSize
  const to = from + normalizedPageSize - 1

  const adminPage = await fetchAdminPageRange(ADMIN_PRIMARY_SELECT, from, to)

  if (adminPage.error) {
    if (isMissingColumnError(adminPage.error)) {
      const fallbackPage = await fetchAdminPageRange(ADMIN_BASE_COLUMNS, from, to)
      if (fallbackPage.error) {
        return {
          responses: [],
          totalCount: 0,
          page: normalizedPage,
          pageSize: normalizedPageSize,
          error: fallbackPage.error,
        }
      }

      const result = buildPaginatedResult(fallbackPage, normalizedPage, normalizedPageSize)
      return resolvePaginatedResult(result)
    }

    return {
      responses: [],
      totalCount: 0,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      error: adminPage.error,
    }
  }

  const result = buildPaginatedResult(adminPage, normalizedPage, normalizedPageSize)
  return resolvePaginatedResult(result)
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

function mapAdminResponseSummary(item: Record<string, unknown>): AdminResponseSummary {
  const responseData = (item.response_data as Record<string, unknown> | null) ?? null
  const piiData = (item.pii_data as Record<string, unknown> | null) ?? null

  let orgType: string | null = null
  if (responseData?.expansionInfo && typeof responseData.expansionInfo === "object") {
    const expansionInfo = responseData.expansionInfo as Record<string, unknown>
    orgType = typeof expansionInfo.orgType === "string" ? expansionInfo.orgType : null
  }

  let expansionTiming: string | null = null
  if (responseData?.projectDetails && typeof responseData.projectDetails === "object") {
    const projectDetails = responseData.projectDetails as Record<string, unknown>
    expansionTiming =
      typeof projectDetails.expansionTiming === "string" ? projectDetails.expansionTiming : null
  }

  return {
    id: item.id as string,
    respondentName: (item.respondent_name as string | null) ?? null,
    organizationName: (item.organization_name as string | null) ?? null,
    rewardStatus: (item.reward_status as RewardStatus | undefined) ?? DEFAULT_REWARD_STATUS,
    rewardSentAt: (item.reward_sent_at as string | null) ?? null,
    rewardNote: (item.reward_note as string | null) ?? null,
    submittedAt: item.submitted_at as string,
    orgType,
    expansionTiming,
    responseData,
    piiData,
  }
}

export function isMissingTableError(error: PostgrestError | null): boolean {
  if (!error) return false
  return error.code === "42P01" // undefined_table
}

function isMissingColumnError(error: PostgrestError | null): boolean {
  if (!error) return false
  return error.code === MISSING_COLUMN_CODE
}

interface AdminPageRangeResult {
  data: Record<string, unknown>[] | null
  count: number | null
  error: PostgrestError | null
}

async function fetchAdminPageRange(selectColumns: string, from: number, to: number): Promise<AdminPageRangeResult> {
  const supabase = createSupabaseServerClient()
  const { data, error, count } = await supabase
    .from("survey_responses")
    .select(selectColumns, { count: "exact" })
    .order("submitted_at", { ascending: false })
    .range(from, to)

  return {
    data: (data as Record<string, unknown>[] | null) ?? null,
    count: count ?? null,
    error,
  }
}

function buildPaginatedResult(
  pageResult: AdminPageRangeResult,
  page: number,
  pageSize: number
): PaginatedAdminResponseResult {
  const responses: AdminResponseSummary[] = (pageResult.data ?? []).map((item) =>
    mapAdminResponseSummary(item)
  )
  const totalCount = typeof pageResult.count === "number" ? pageResult.count : responses.length
  return {
    responses,
    totalCount,
    page,
    pageSize,
    error: null,
  }
}

async function resolvePaginatedResult(result: PaginatedAdminResponseResult): Promise<PaginatedAdminResponseResult> {
  if (result.totalCount > 0) {
    const maxPage = Math.max(1, Math.ceil(result.totalCount / result.pageSize))
    if (result.page > maxPage) {
      return fetchSurveyResponsesPage({ page: maxPage, pageSize: result.pageSize })
    }
  }

  return result
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
