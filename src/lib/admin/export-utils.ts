import { getSurveyQuestionSummaries } from "@/lib/survey/schema-loader"
import type { SurveyResponseRecord } from "@/lib/supabase/responses"

type ExportType = "all" | "response" | "pii"

interface FieldMapping {
  source: "meta" | "pii" | "response"
  path: string[]
}

// question-aggregator.ts의 QUESTION_FIELD_MAP과 동일한 매핑
const QUESTION_FIELD_MAP: Record<string, FieldMapping> = {
  name: { source: "pii", path: ["name"] },
  position: { source: "response", path: ["basicInfo", "position"] },
  contact_tel: { source: "pii", path: ["tel"] },
  contact_mobile: { source: "pii", path: ["mobile"] },
  contact_email: { source: "pii", path: ["email"] },
  address: { source: "pii", path: ["address"] },
  A1: { source: "response", path: ["expansionInfo", "orgType"] },
  A2_org_name: { source: "response", path: ["expansionInfo", "medicalOrgName"] },
  A2_org_type: { source: "response", path: ["expansionInfo", "medicalOrgCategory"] },
  A2_found_type: { source: "response", path: ["expansionInfo", "foundationType"] },
  A2_legal_subtype: { source: "response", path: ["expansionInfo", "legalType"] },
  A3_company_name: { source: "response", path: ["expansionInfo", "companyName"] },
  A3_company_type: { source: "response", path: ["expansionInfo", "companyCategory"] },
  B1: { source: "response", path: ["projectDetails", "expansionTiming"] },
  B2: { source: "response", path: ["projectDetails", "targetCountries"] },
  B3: { source: "response", path: ["projectDetails", "expansionReason"] },
  B4: { source: "response", path: ["projectDetails", "services"] },
  B5_1_1: { source: "response", path: ["projectDetails", "projectName"] },
  B5_1_1_1: { source: "response", path: ["projectDetails", "reportingAwareness1"] },
  B5_2: { source: "response", path: ["projectDetails", "reportingAwareness2"] },
  B6: { source: "response", path: ["projectDetails", "departments"] },
  B7: { source: "response", path: ["projectDetails", "hasEvidence"] },
  C1: { source: "response", path: ["policyNeeds", "difficultiesRank"] },
  C2: { source: "response", path: ["policyNeeds", "supportNeedsRank"] },
  C3: { source: "response", path: ["policyNeeds", "desiredSupport"] },
  C4: { source: "response", path: ["policyNeeds", "awareness"] },
  C5: { source: "response", path: ["policyNeeds", "additionalComments"] },
}

interface ExportColumn {
  id: string
  label: string
  source: "meta" | "pii" | "response"
  path?: string[]
}

/**
 * 내보내기 타입에 따라 포함할 컬럼 목록 생성
 */
function getExportColumns(type: ExportType): ExportColumn[] {
  const columns: ExportColumn[] = [
    { id: "id", label: "응답 ID", source: "meta" },
    { id: "submitted_at", label: "제출 일시", source: "meta" },
  ]

  // survey_schema.json의 질문 순서대로 가져오기
  const questions = getSurveyQuestionSummaries()

  for (const question of questions) {
    const mapping = QUESTION_FIELD_MAP[question.questionId]
    if (!mapping) continue

    // 타입에 따라 필터링
    if (type === "pii" && mapping.source !== "pii") continue
    if (type === "response" && mapping.source === "pii") continue

    columns.push({
      id: question.questionId,
      label: question.questionLabel,
      source: mapping.source,
      path: mapping.path,
    })
  }

  return columns
}

/**
 * 경로를 따라 값 추출
 */
function extractValue(
  entry: SurveyResponseRecord,
  column: ExportColumn
): string | number | boolean {
  // 메타 데이터
  if (column.source === "meta") {
    if (column.id === "id") return entry.id
    if (column.id === "submitted_at") return entry.submittedAt
    return ""
  }

  // 데이터 소스 선택
  const sourceData = column.source === "pii" ? entry.piiData : entry.responseData
  if (!sourceData || !column.path) return ""

  // 경로를 따라 값 추출
  let current: unknown = sourceData
  for (const segment of column.path) {
    if (!current || typeof current !== "object") {
      return ""
    }
    current = (current as Record<string, unknown>)[segment]
  }

  // 값 정규화
  if (current === null || current === undefined) {
    return ""
  }

  if (Array.isArray(current)) {
    // 배열은 세미콜론으로 구분
    return current
      .map((item) => {
        if (typeof item === "string") return item
        if (typeof item === "number" || typeof item === "boolean") return String(item)
        return ""
      })
      .filter((item) => item.length > 0)
      .join("; ")
  }

  if (typeof current === "object") {
    // 객체는 JSON 문자열로
    return JSON.stringify(current)
  }

  return current as string | number | boolean
}

/**
 * 순서대로 정렬된 내보내기 데이터 생성
 */
export function buildOrderedExportData(
  entries: SurveyResponseRecord[],
  type: ExportType
): Record<string, string | number | boolean>[] {
  const columns = getExportColumns(type)

  return entries.map((entry) => {
    const row: Record<string, string | number | boolean> = {}

    for (const column of columns) {
      row[column.label] = extractValue(entry, column)
    }

    return row
  })
}

/**
 * CSV 값 이스케이프
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ""
  }

  const str = String(value)

  // 쉼표, 따옴표, 줄바꿈이 있으면 따옴표로 감싸기
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * 순서가 보장된 CSV 생성
 */
export function convertToOrderedCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) {
    return ""
  }

  // 첫 번째 행의 키 순서를 그대로 사용 (이미 순서대로 정렬됨)
  const headers = Object.keys(data[0])
  const headerRow = headers.map((h) => escapeCsvValue(h)).join(",")

  const rows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header]
        return escapeCsvValue(value)
      })
      .join(",")
  })

  return [headerRow, ...rows].join("\n")
}

