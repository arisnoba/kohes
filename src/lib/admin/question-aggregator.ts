import type { SurveyQuestionSummary } from "@/lib/survey/schema-loader"
import type { SurveyResponseRecord } from "@/lib/supabase/responses"

type SourceKind = "response" | "pii"

interface FieldMapping {
  source: SourceKind
  path: string[]
  sensitive?: boolean
}

const MAX_TEXT_SAMPLES = 3

const QUESTION_FIELD_MAP: Record<string, FieldMapping> = {
  name: { source: "pii", path: ["name"], sensitive: true },
  position: { source: "response", path: ["basicInfo", "position"] },
  contact_tel: { source: "pii", path: ["tel"], sensitive: true },
  contact_mobile: { source: "pii", path: ["mobile"], sensitive: true },
  contact_email: { source: "pii", path: ["email"], sensitive: true },
  address: { source: "pii", path: ["address"], sensitive: true },
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

const ADDITIONAL_TEXT_FIELDS: Record<string, FieldMapping> = {
  C1: { source: "response", path: ["policyNeeds", "difficultiesOther"] },
  C2: { source: "response", path: ["policyNeeds", "supportNeedsOther"] },
  C3: { source: "response", path: ["policyNeeds", "desiredSupportOther"] },
}

const VALUE_LABEL_OVERRIDES: Record<string, Record<string, string>> = {
  A1: {
    회사: "회사 (MSO 등)",
  },
  A3_company_type: {
    MSO: "MSO (병원경영지원회사)",
  },
  B3: {
    "선교·자선": "선교·자선 활동의 목적",
  },
  B4: {
    개설운영_신설: "의료기관 개설·운영 (신설)",
    개설운영_인수합병: "의료기관 개설·운영 (인수합병)",
    수탁운영: "수탁운영",
    컨설팅: "운영 컨설팅",
    파견: "종사자 파견",
    기술이전: "의료기술 이전",
    정보시스템이전: "정보시스템 이전",
    의약품제공: "국외 의료서비스 제공 위한 의약품 제공",
    의료기기제공: "국외 의료서비스 제공 위한 의료기기 등 제공",
    교육_국내: "의료인 교육 (국내 연수)",
    교육_해외: "의료인 교육 (해외 방문연수)",
    기타: "기타",
  },
  C1: {
    "해외 정보 부족": "현지(해외) 정보 부족",
    "파트너 신뢰 문제": "현지(해외) 파트너 신뢰의 어려움",
    "정치·법·제도": "불안정한 현지(해외) 정치·법·제도",
    "전문 인력 부족": "의료 해외진출 관련 전문인력 부족",
    "현지 고용 어려움": "현지(해외) 전문인력 고용의 어려움",
    "네트워크 부재": "현지 네트워크 부재",
  },
}

export interface AggregatedOptionStat {
  value: string
  displayValue: string
  count: number
  percentage: number
  totalScore?: number
  averageScore?: number
  averageRank?: number // 평균 순위 (낮을수록 중요)
  rankDistribution?: number[] // 각 순위로 선택된 횟수 [1위 횟수, 2위 횟수, ...]
}

export interface AggregatedQuestionStats {
  questionId: string
  answeredCount: number
  optionStats: AggregatedOptionStat[]
  sampleValues: string[]
  otherTexts: string[]
  isSensitive: boolean
  supported: boolean
}

export interface AggregationResult {
  totalResponses: number
  statsByQuestion: Map<string, AggregatedQuestionStats>
}

export function aggregateSurveyResponses(
  questions: SurveyQuestionSummary[],
  entries: SurveyResponseRecord[]
): AggregationResult {
  const statsByQuestion = new Map<string, AggregatedQuestionStats>()

  for (const question of questions) {
    const mapping = QUESTION_FIELD_MAP[question.questionId]

    if (!mapping) {
      statsByQuestion.set(question.questionId, {
        questionId: question.questionId,
        answeredCount: 0,
        optionStats: [],
        sampleValues: [],
        otherTexts: [],
        isSensitive: false,
        supported: false,
      })
      continue
    }

    const accumulator = accumulateQuestionStats(question, entries, mapping)
    statsByQuestion.set(question.questionId, accumulator)
  }

  return { totalResponses: entries.length, statsByQuestion }
}

function accumulateQuestionStats(
  question: SurveyQuestionSummary,
  entries: SurveyResponseRecord[],
  mapping: FieldMapping
): AggregatedQuestionStats {
  let answeredCount = 0
  // B2(해외진출 대상국)는 텍스트지만 choice처럼 집계
  const isChoiceQuestion =
    question.questionType === "multi_choice" ||
    question.questionType === "rank_choice" ||
    question.questionId === "B2"
  const counts = new Map<
    string,
    { count: number; display: string; totalScore?: number; rankSum?: number; rankDist?: number[] }
  >()
  const sampleValues: string[] = []

  const weights = Array.isArray((question.scoring as any)?.weights)
    ? ((question.scoring as any).weights as number[])
    : []

  const isRankChoice = question.questionType === "rank_choice"
  const rankCount = question.rankCount ?? weights.length

  for (const entry of entries) {
    const raw = extractValue(entry, mapping)

    if (mapping.sensitive) {
      if (hasAnswer(raw, question.questionType)) {
        answeredCount += 1
      }
      continue
    }

    if (isChoiceQuestion) {
      // B2는 배열 또는 쉼표로 구분된 문자열로 저장될 수 있음
      let values: string[] = []
      if (question.questionId === "B2") {
        // DEBUG: B2 raw 값 확인
        console.log("[B2 DEBUG] raw:", raw, "type:", typeof raw)
        if (Array.isArray(raw)) {
          values = raw.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        } else if (typeof raw === "string" && raw.trim().length > 0) {
          values = raw
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v.length > 0)
        }
        console.log("[B2 DEBUG] parsed values:", values)
      } else {
        values = normalizeToArray(raw)
      }

      if (!values || !values.length) continue

      answeredCount += 1

      values.forEach((value, index) => {
        const displayValue = getDisplayValue(question.questionId, value)
        const key = value
        const current = counts.get(key) ?? {
          count: 0,
          display: displayValue,
          totalScore: 0,
          rankSum: 0,
          rankDist: isRankChoice ? new Array(rankCount).fill(0) : undefined,
        }
        current.count += 1

        if (isRankChoice) {
          const weight = weights[index] ?? Math.max(weights[weights.length - 1] ?? 0, 0)
          current.totalScore = (current.totalScore ?? 0) + weight

          // 순위 추적 (index는 0부터, 실제 순위는 1부터)
          const actualRank = index + 1
          current.rankSum = (current.rankSum ?? 0) + actualRank

          // 순위별 분포 기록
          if (current.rankDist && index < rankCount) {
            current.rankDist[index] = (current.rankDist[index] ?? 0) + 1
          }
        }

        counts.set(key, current)
      })
    } else {
      const value = normalizeToString(raw)
      if (!value) continue

      answeredCount += 1

      const current = counts.get(value) ?? { count: 0, display: value }
      current.count += 1
      counts.set(value, current)

      // B5_1_1의 경우 모든 값을 수집 (아코디언 표시용)
      if (question.questionId === "B5_1_1") {
        if (!sampleValues.includes(value)) {
          sampleValues.push(value)
        }
      } else if (sampleValues.length < MAX_TEXT_SAMPLES && !sampleValues.includes(value)) {
        sampleValues.push(value)
      }
    }
  }

  const optionStats: AggregatedOptionStat[] = []

  counts.forEach((value, key) => {
    if (answeredCount === 0) return

    const percentage = (value.count / answeredCount) * 100
    const stat: AggregatedOptionStat = {
      value: key,
      displayValue: value.display,
      count: value.count,
      percentage,
    }

    if (question.questionType === "rank_choice" && value.totalScore !== undefined) {
      stat.totalScore = value.totalScore
      stat.averageScore = value.count > 0 ? value.totalScore / value.count : 0

      // 평균 순위 계산 (낮을수록 중요)
      if (value.rankSum !== undefined && value.count > 0) {
        stat.averageRank = value.rankSum / value.count
      }

      // 순위별 분포
      if (value.rankDist) {
        stat.rankDistribution = value.rankDist
      }
    }

    optionStats.push(stat)
  })

  const sortedStats = optionStats.sort((a, b) => {
    if (question.questionType === "rank_choice") {
      if ((b.totalScore ?? 0) !== (a.totalScore ?? 0)) {
        return (b.totalScore ?? 0) - (a.totalScore ?? 0)
      }
    }
    if (b.count !== a.count) {
      return b.count - a.count
    }
    return a.displayValue.localeCompare(b.displayValue)
  })

  const otherTexts = collectAdditionalTexts(question.questionId, entries)

  return {
    questionId: question.questionId,
    answeredCount,
    optionStats: sortedStats,
    sampleValues,
    otherTexts,
    isSensitive: Boolean(mapping.sensitive),
    supported: true,
  }
}

function collectAdditionalTexts(questionId: string, entries: SurveyResponseRecord[]): string[] {
  const mapping = ADDITIONAL_TEXT_FIELDS[questionId]
  if (!mapping) return []

  const values: string[] = []

  for (const entry of entries) {
    const raw = extractValue(entry, mapping)
    const normalized = normalizeToString(raw)
    if (!normalized) continue

    values.push(normalized)

    if (values.length >= MAX_TEXT_SAMPLES) {
      break
    }
  }

  return values
}

function extractValue(entry: SurveyResponseRecord, mapping: FieldMapping): unknown {
  const root = mapping.source === "pii" ? entry.piiData : entry.responseData
  if (!root || typeof root !== "object") return null

  let current: unknown = root

  for (const segment of mapping.path) {
    if (!current || typeof current !== "object") {
      return null
    }

    current = (current as Record<string, unknown>)[segment]
  }

  return current ?? null
}

function normalizeToString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (Array.isArray(value)) {
    const flattened = value
      .map((item) => {
        if (typeof item === "string") return item.trim()
        if (typeof item === "number" || typeof item === "boolean") return String(item)
        return ""
      })
      .filter((item) => item.length > 0)

    if (!flattened.length) return null
    return flattened.join(", ")
  }

  return null
}

function normalizeToArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => normalizeToString(item))
    .filter((item): item is string => Boolean(item))
}

function getDisplayValue(questionId: string, rawValue: string): string {
  const overrides = VALUE_LABEL_OVERRIDES[questionId]
  if (overrides?.[rawValue]) {
    return overrides[rawValue]
  }

  return rawValue
}

function hasAnswer(value: unknown, questionType: string): boolean {
  if (questionType === "multi_choice" || questionType === "rank_choice") {
    return normalizeToArray(value).length > 0
  }

  return normalizeToString(value) !== null
}
