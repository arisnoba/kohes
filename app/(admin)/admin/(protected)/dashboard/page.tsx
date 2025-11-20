import { Fragment } from "react"

import { SimplePieChart } from "@/components/admin/SimplePieChart"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type SurveyQuestionSummary, getSurveyQuestionSummaries } from "@/lib/survey/schema-loader"
import {
  aggregateSurveyResponses,
  type AggregatedQuestionStats,
} from "@/lib/admin/question-aggregator"
import { fetchSurveyResponsePayloads, isMissingTableError } from "@/lib/supabase/responses"

const QUESTION_TYPE_LABELS: Record<string, string> = {
  text: "단답형",
  textarea: "서술형",
  single_choice: "단일 선택",
  multi_choice: "복수 선택",
  rank_choice: "순위 선택",
}

const NUMBER_FORMATTER = new Intl.NumberFormat("ko-KR")
const PERCENT_FORMATTER = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
})
const SCORE_FORMATTER = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
})

// 캐싱 방지: 항상 최신 데이터를 가져오도록 강제
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const questionSummaries = getSurveyQuestionSummaries()
  const sections = groupBySection(questionSummaries)
  const { entries, totalCount, error } = await fetchSurveyResponsePayloads()

  if (isMissingTableError(error)) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">설문 문항별 응답 관리</h2>
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">survey_responses 테이블을 찾을 수 없습니다.</p>
          <p className="mt-2">
            Supabase CLI 로컬 DB 또는 원격 프로젝트에 아래 마이그레이션을 적용해주세요.
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              `supabase/migrations/20240127000000_create_survey_responses.sql` 파일을 확인합니다.
            </li>
            <li>`pnpm supabase db push` 명령으로 마이그레이션을 적용합니다.</li>
            <li>필요 시 `pnpm supabase:start`로 로컬 Supabase를 먼저 실행합니다.</li>
          </ol>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">설문 문항별 응답 관리</h2>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold">Supabase에서 데이터를 가져오는 중 오류가 발생했습니다.</p>
          <p className="mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const aggregation = aggregateSurveyResponses(questionSummaries, entries)
  const { statsByQuestion } = aggregation
  const totalResponses = totalCount
  const hasResponses = totalResponses > 0
  const summaryLookup = new Map(questionSummaries.map((summary) => [summary.questionId, summary]))
  const highlightCharts = ["A1", "B1", "C4"]
    .map((questionId) => {
      const summary = summaryLookup.get(questionId)
      const stats = statsByQuestion.get(questionId)
      if (!summary || !stats) {
        return null
      }

      const data = stats.optionStats.map((option) => ({
        name: option.displayValue,
        value: option.count,
        percentage: Number.isFinite(option.percentage) ? option.percentage : 0,
      }))

      return {
        questionId,
        title: `${summary.questionId}. ${summary.questionLabel}`,
        data,
      }
    })
    .filter(
      (
        chart
      ): chart is {
        questionId: string
        title: string
        data: Array<{ name: string; value: number; percentage: number }>
      } => chart !== null
    )

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">설문 문항별 응답 관리</h2>
        <p className="text-sm text-muted-foreground">문항별 응답 분포를 확인할 수 있습니다.</p>
      </div>

      {highlightCharts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highlightCharts.map((chart) => (
            <SimplePieChart key={chart.questionId} data={chart.data} title={chart.title} />
          ))}
        </div>
      ) : null}

      {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-background p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">총 설문 응답</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {NUMBER_FORMATTER.format(totalResponses)}건
          </p>
          {!hasResponses ? (
            <p className="mt-2 text-xs text-muted-foreground">
              아직 제출된 응답이 없습니다. 새로운 응답이 저장되면 자동으로 통계가 채워집니다.
            </p>
          ) : null}
        </div>
      </div> */}

      <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>문항</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>필수</TableHead>
              <TableHead className="text-right">응답 수</TableHead>
              <TableHead className="w-[50%]">주요 응답 요약</TableHead>
              {/* <TableHead className="min-w-[220px]">선택지 요약</TableHead> */}
              {/* <TableHead className="min-w-[220px]">출현 조건</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <Fragment key={section.sectionId}>
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="bg-muted/60 text-sm font-semibold text-muted-foreground"
                  >
                    {section.sectionTitle}
                  </TableCell>
                </TableRow>
                {section.questions.map((question) => {
                  const stats = statsByQuestion.get(question.questionId)
                  return (
                    <TableRow key={`${question.sectionId}-${question.questionId}`}>
                      <TableCell className="space-y-1 align-top">
                        <div className="font-medium text-foreground">{question.questionLabel}</div>
                        <div className="text-xs text-muted-foreground">{question.questionId}</div>
                        {question.path.length > 0 ? (
                          <div className="text-xs text-muted-foreground">
                            경로: {question.path.join(" › ")}
                          </div>
                        ) : null}
                        {question.notes ? (
                          <div className="text-xs text-muted-foreground">
                            비고: {question.notes}
                          </div>
                        ) : null}
                        {question.help ? (
                          <div className="text-xs text-muted-foreground">
                            도움말: {question.help}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="align-top text-sm text-muted-foreground">
                        {QUESTION_TYPE_LABELS[question.questionType] ?? question.questionType}
                        {question.questionType === "rank_choice" && question.rankCount ? (
                          <div className="text-xs text-muted-foreground">
                            순위 선택 {question.rankCount}개
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge variant={question.required ? "default" : "secondary"}>
                          {question.required ? "필수" : "선택"}
                        </Badge>
                        {question.allowDuplicates ? (
                          <div className="text-xs text-muted-foreground">중복 허용</div>
                        ) : null}
                      </TableCell>
                      <TableCell className="align-top text-right text-sm text-muted-foreground">
                        {stats ? (
                          <div className="space-y-1">
                            <div className="text-base font-semibold text-foreground">
                              {NUMBER_FORMATTER.format(stats.answeredCount)}건
                            </div>
                            <div className="text-xs text-muted-foreground">
                              전체 {NUMBER_FORMATTER.format(totalResponses)}건 중
                            </div>
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[300px] align-top">
                        {renderResponseSummary(question, stats)}
                      </TableCell>
                      {/* <TableCell className="align-top text-sm text-muted-foreground">
                        {formatOptionPreview(question)}
                      </TableCell> */}
                      {/* <TableCell className="align-top text-sm text-muted-foreground">
                        {formatCondition(question)}
                      </TableCell> */}
                    </TableRow>
                  )
                })}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        ※ 통계는 최신 {NUMBER_FORMATTER.format(totalResponses)}건의 응답을 기준으로 계산됩니다.
      </p>
    </div>
  )
}

function groupBySection(summaries: SurveyQuestionSummary[]) {
  const grouped: Array<{
    sectionId: string
    sectionTitle: string
    questions: SurveyQuestionSummary[]
  }> = []
  const lookup = new Map<string, number>()

  summaries.forEach((summary) => {
    if (!lookup.has(summary.sectionId)) {
      lookup.set(summary.sectionId, grouped.length)
      grouped.push({
        sectionId: summary.sectionId,
        sectionTitle: summary.sectionTitle,
        questions: [],
      })
    }
    const index = lookup.get(summary.sectionId) ?? 0
    grouped[index]!.questions.push(summary)
  })

  return grouped
}

function renderResponseSummary(question: SurveyQuestionSummary, stats?: AggregatedQuestionStats) {
  if (!stats) {
    return <div className="text-sm text-muted-foreground">Supabase 매핑을 찾을 수 없습니다.</div>
  }

  if (stats.isSensitive) {
    return (
      <div className="text-xs text-muted-foreground">
        민감 정보 보호를 위해 집계 수치만 제공합니다. 총{" "}
        {NUMBER_FORMATTER.format(stats.answeredCount)}건의 응답이 수집되었습니다.
      </div>
    )
  }

  if (stats.answeredCount === 0) {
    return <div className="text-sm text-muted-foreground">응답이 아직 없습니다.</div>
  }

  const topOptions = stats.optionStats.slice(0, 3)
  const remainder = stats.optionStats.length - topOptions.length
  const showSamples =
    (question.questionType === "text" || question.questionType === "textarea") &&
    stats.sampleValues.length > 0

  return (
    <div className="space-y-2 text-sm text-foreground">
      <div className="space-y-1">
        {topOptions.map((option) => (
          <div key={option.value} className="leading-snug">
            <div className="break-words font-medium text-foreground">{option.displayValue}</div>
            <div className="text-xs text-muted-foreground">
              {NUMBER_FORMATTER.format(option.count)}건 ({formatPercentage(option.percentage)})
              {option.totalScore !== undefined ? (
                <>
                  {" · "}
                  총점 {formatScore(option.totalScore)}
                  {option.averageScore !== undefined ? (
                    <>
                      {" / 평균 "}
                      {formatScore(option.averageScore)}
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        ))}
        {remainder > 0 ? (
          <div className="text-xs text-muted-foreground">... 외 {remainder}개 응답 항목</div>
        ) : null}
      </div>
      {showSamples ? (
        <div className="space-y-1 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
          {stats.sampleValues.map((sample, index) => (
            <div key={`${sample}-${index}`} className="truncate">
              • {truncate(sample)}
            </div>
          ))}
        </div>
      ) : null}
      {stats.otherTexts.length > 0 ? (
        <div className="text-xs text-muted-foreground">
          기타 입력 예시: {formatOtherTexts(stats.otherTexts)}
        </div>
      ) : null}
    </div>
  )
}

function formatOptionPreview(question: SurveyQuestionSummary) {
  if (!question.options.length) {
    return "-"
  }

  const preview = question.options.slice(0, 3).join(", ")
  const remainder = question.optionCount - Math.min(question.optionCount, 3)

  return remainder > 0 ? `${preview} 외 ${remainder}개` : preview
}

function formatCondition(question: SurveyQuestionSummary) {
  const parts: string[] = []

  if (question.showIf && Object.keys(question.showIf).length > 0) {
    parts.push(`모두 충족: ${formatConditionRules(question.showIf)}`)
  }

  if (question.showIfAny && Object.keys(question.showIfAny).length > 0) {
    parts.push(`하나 이상: ${formatConditionRules(question.showIfAny)}`)
  }

  return parts.length > 0 ? parts.join(" / ") : "-"
}

function formatConditionRules(rules: Record<string, unknown>) {
  return Object.entries(rules)
    .map(([field, value]) => {
      if (Array.isArray(value)) {
        return `${field} → ${value.join(", ")}`
      }
      if (typeof value === "object" && value !== null) {
        return `${field} → ${JSON.stringify(value)}`
      }
      return `${field} → ${String(value)}`
    })
    .join(", ")
}

function formatPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return "0%"
  }
  return `${PERCENT_FORMATTER.format(value)}%`
}

function formatScore(value: number) {
  if (!Number.isFinite(value)) {
    return "0"
  }
  return SCORE_FORMATTER.format(value)
}

function formatOtherTexts(values: string[]) {
  return values.map((value, index) => `${index + 1}. ${truncate(value)}`).join(" / ")
}

function truncate(value: string, max = 80) {
  if (value.length <= max) return value
  return `${value.slice(0, max)}...`
}
