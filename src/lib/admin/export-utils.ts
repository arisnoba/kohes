import { getSurveyQuestionSummaries } from "@/lib/survey/schema-loader"
import type { SurveyResponseRecord } from "@/lib/d1/responses"
import ExcelJS from "exceljs"

type ExportType = "all" | "response" | "pii"

interface FieldMapping {
  source: "meta" | "pii" | "response"
  path: string[]
}

// question-aggregator.ts의 QUESTION_FIELD_MAP과 동일한 매핑
const QUESTION_FIELD_MAP: Record<string, FieldMapping> = {
  eligible: { source: "response", path: ["basicInfo", "eligible"] },
  privacyConsent: { source: "response", path: ["basicInfo", "privacyConsent"] },
  A2_legal_name: { source: "response", path: ["expansionInfo", "legalName"] },
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

const OTHER_FIELD_OVERRIDES: Record<string, string> = {
  medicalOrgCategory: "medicalOrgCategoryOther",
  foundationType: "foundationTypeOther",
  legalType: "legalTypeOther",
  companyCategory: "companyCategoryOther",
  difficultiesRank: "difficultiesOther",
  supportNeedsRank: "supportNeedsOther",
  services: "servicesOther",
  departments: "departmentsOther",
  expansionTiming: "expansionTimingOther",
  expansionReason: "expansionReasonOther",
  desiredSupport: "desiredSupportOther",
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
 * 경로를 따라 값 추출 (원본)
 */
function extractRawValue(data: unknown, path: string[]): unknown {
  let current: unknown = data
  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return null
    }
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

/**
 * "기타" 또는 "그 외 국제의료사업" 옵션에 입력된 내용을 병합
 */
function decorateWithOther(values: string[], otherValue: string | null): string[] {
  const trimmedOther = otherValue?.trim()

  // otherValue가 없으면 원본 배열 그대로 반환
  if (!trimmedOther) return values

  const decorated = values.map((raw) => {
    const option = raw.trim()
    if (!option) return option

    // "그 외 국제의료사업"인 경우
    if (option === "그 외 국제의료사업") {
      return `그 외 국제의료사업 : ${trimmedOther}`
    }

    // "기타"로 시작하거나, "기타"와 완전 일치하는 경우
    const normalized = option.replace(/\s*\(.*\)$/u, "").trim()
    if (normalized === "기타" || normalized.startsWith("기타")) {
      return `기타 : ${trimmedOther}`
    }

    return option
  })

  return decorated.filter((item) => item.length > 0)
}

/**
 * 단일 선택 값에 "기타" 내용 병합
 */
function decorateSingleWithOther(value: string | null, otherValue: string | null): string {
  if (!value?.trim()) return otherValue?.trim() || ""

  const trimmedValue = value.trim()
  const trimmedOther = otherValue?.trim()

  if (trimmedValue === "기타" && trimmedOther) {
    return `기타 : ${trimmedOther}`
  }

  return trimmedValue
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
  const current = extractRawValue(sourceData, column.path)

  // 값 정규화
  if (current === null || current === undefined) {
    return ""
  }

  // 배열 값 처리 (다중 선택, 순위 선택)
  if (Array.isArray(current)) {
    const section = column.path[0]
    const field = column.path[column.path.length - 1]
    const otherFieldName = OTHER_FIELD_OVERRIDES[field] ?? `${field}Other`

    // *Other 필드 값 추출
    const otherPath = [...column.path.slice(0, -1), otherFieldName]
    const otherValue = extractRawValue(sourceData, otherPath)
    const otherStr = typeof otherValue === "string" ? otherValue : null

    // 문자열 배열로 변환
    const stringArray = current
      .map((item) => {
        if (typeof item === "string") return item
        if (typeof item === "number" || typeof item === "boolean") return String(item)
        return ""
      })
      .filter((item) => item.length > 0)

    // "기타" 입력 병합
    const decorated = decorateWithOther(stringArray, otherStr)
    return decorated.join(" | ")
  }

  // 단일 선택 값 처리
  if (typeof current === "string") {
    const section = column.path[0]
    const field = column.path[column.path.length - 1]
    const otherFieldName = OTHER_FIELD_OVERRIDES[field] ?? `${field}Other`

    // *Other 필드 값 추출
    const otherPath = [...column.path.slice(0, -1), otherFieldName]
    const otherValue = extractRawValue(sourceData, otherPath)
    const otherStr = typeof otherValue === "string" ? otherValue : null

    return decorateSingleWithOther(current, otherStr)
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

/**
 * Excel 파일 생성 (UTF-8 인코딩, 한글 지원)
 */
export async function convertToExcel(data: Record<string, unknown>[]): Promise<Buffer> {
  if (data.length === 0) {
    throw new Error("내보낼 데이터가 없습니다.")
  }

  // 워크북 생성
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "KOHES Survey System"
  workbook.created = new Date()

  // 워크시트 생성
  const worksheet = workbook.addWorksheet("응답 데이터", {
    properties: { defaultColWidth: 20 },
  })

  // 헤더 추출
  const headers = Object.keys(data[0])

  // 헤더 행 추가 (스타일링)
  const headerRow = worksheet.addRow(headers)
  headerRow.font = { bold: true, size: 11 }
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  }
  headerRow.alignment = { vertical: "middle", horizontal: "center" }

  // 데이터 행 추가
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header]

      // null/undefined 처리
      if (value === null || value === undefined) {
        return ""
      }

      // 날짜 처리
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value)
      }

      // 숫자 처리
      if (typeof value === "number") {
        return value
      }

      // 문자열 처리
      return String(value)
    })

    worksheet.addRow(values)
  })

  // 열 너비 자동 조정
  worksheet.columns.forEach((column, index) => {
    let maxLength = headers[index].length

    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const cellValue = cell.value?.toString() || ""
      maxLength = Math.max(maxLength, cellValue.length)
    })

    // 최소 10, 최대 50 글자로 제한
    column.width = Math.min(Math.max(maxLength + 2, 10), 50)
  })

  // 첫 행 고정 (헤더 고정)
  worksheet.views = [{ state: "frozen", ySplit: 1 }]

  // 버퍼로 변환
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
