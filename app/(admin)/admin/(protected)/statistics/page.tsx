import { Fragment } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getSurveyQuestionSummaries } from "@/lib/survey/schema-loader"
import {
  aggregateSurveyResponses,
  type AggregatedQuestionStats,
  type AggregatedOptionStat,
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

export default async function StatisticsPage() {
  const allQuestions = getSurveyQuestionSummaries()
  // 기초정보(intro) 섹션 제외 - 개인정보는 통계에서 제외
  const questionSummaries = allQuestions.filter((q) => q.sectionId !== "intro")
  const { entries, totalCount, error } = await fetchSurveyResponsePayloads()

  if (isMissingTableError(error)) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">문항별 통계</h2>
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
        <h2 className="text-2xl font-bold">문항별 통계</h2>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold">Supabase에서 데이터를 가져오는 중 오류가 발생했습니다.</p>
          <p className="mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const aggregation = aggregateSurveyResponses(questionSummaries, entries)
  const { statsByQuestion } = aggregation

  // 섹션별로 그룹화
  const sections = groupBySection(questionSummaries)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">문항별 통계</h2>
        <p className="text-sm text-muted-foreground">
          각 설문 문항에 대한 응답 분포와 통계를 확인할 수 있습니다. (개인정보는 제외)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전체 응답 현황</CardTitle>
          <CardDescription>수집된 설문 응답 총계</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{NUMBER_FORMATTER.format(totalCount)}건</div>
          {totalCount === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">아직 제출된 응답이 없습니다.</p>
          )}
        </CardContent>
      </Card>

      {sections.map((section) => (
        <div key={section.sectionId} className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{section.sectionTitle}</h3>
            <Badge variant="outline">{section.questions.length}개 문항</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {section.questions.map((question) => {
              const stats = statsByQuestion.get(question.questionId)
              return (
                <QuestionStatCard
                  key={question.questionId}
                  question={question}
                  stats={stats}
                  totalResponses={totalCount}
                />
              )
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-muted-foreground">
        ※ 통계는 최신 {NUMBER_FORMATTER.format(totalCount)}건의 응답을 기준으로 계산됩니다.
      </p>
    </div>
  )
}

function groupBySection(summaries: ReturnType<typeof getSurveyQuestionSummaries>) {
  const grouped: Array<{
    sectionId: string
    sectionTitle: string
    questions: typeof summaries
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

interface QuestionStatCardProps {
  question: ReturnType<typeof getSurveyQuestionSummaries>[number]
  stats?: AggregatedQuestionStats
  totalResponses: number
}

function QuestionStatCard({ question, stats, totalResponses }: QuestionStatCardProps) {
  const typeLabel = QUESTION_TYPE_LABELS[question.questionType] ?? question.questionType
  const hasStats = stats && stats.answeredCount > 0
  const isRankChoice = question.questionType === "rank_choice"

  // Scoring 정보 추출
  const scoringInfo =
    isRankChoice && question.scoring
      ? (question.scoring as { weights_desc?: string; weights?: number[] })
      : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base">{question.questionLabel}</CardTitle>
            <CardDescription className="text-xs">{question.questionId}</CardDescription>
          </div>
          <Badge variant="outline" className="shrink-0">
            {typeLabel}
          </Badge>
        </div>
        {question.help && <p className="text-xs text-muted-foreground">{question.help}</p>}
        {scoringInfo?.weights_desc && (
          <div className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
            점수 계산: {scoringInfo.weights_desc}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {!stats ? (
          <div className="text-sm text-muted-foreground">통계를 사용할 수 없습니다.</div>
        ) : stats.isSensitive ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {NUMBER_FORMATTER.format(stats.answeredCount)}건
              </span>
              <Badge variant="secondary">🔒 민감 정보</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              개인정보 보호를 위해 응답 건수만 제공합니다.
            </p>
          </div>
        ) : !hasStats ? (
          <div className="text-sm text-muted-foreground">아직 응답이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {NUMBER_FORMATTER.format(stats.answeredCount)}건
              </span>
              <span className="text-sm text-muted-foreground">
                / {NUMBER_FORMATTER.format(totalResponses)}건
              </span>
            </div>

            {/* Choice questions: show bar chart */}
            {(question.questionType === "single_choice" ||
              question.questionType === "multi_choice" ||
              question.questionType === "rank_choice") &&
              stats.optionStats.length > 0 && (
                <div className="space-y-2">
                  {stats.optionStats.map((option) => (
                    <OptionBar key={option.value} option={option} question={question} />
                  ))}
                </div>
              )}

            {/* Text/Textarea questions: show samples */}
            {(question.questionType === "text" || question.questionType === "textarea") &&
              stats.sampleValues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">응답 예시</p>
                  {/* B5_1_1의 경우 아코디언으로 모든 항목 표시 */}
                  {question.questionId === "B5_1_1" && stats.optionStats.length > 0 ? (
                    <Accordion>
                      <AccordionItem value={`b5_1_1_${question.questionId}`}>
                        <AccordionTrigger className="text-xs py-2">
                          전체 응답 보기 ({stats.optionStats.length}개)
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 max-h-[400px] overflow-y-auto rounded-md bg-muted/40 p-3">
                            {stats.optionStats.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-start gap-2 py-2 border-b last:border-0"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-foreground break-words">
                                    {option.displayValue}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {NUMBER_FORMATTER.format(option.count)}건 (
                                    {formatPercentage(option.percentage)})
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <div className="space-y-1 rounded-md bg-muted/40 p-3">
                      {stats.sampleValues.map((sample, index) => (
                        <div key={`${sample}-${index}`} className="text-xs text-muted-foreground">
                          • {truncate(sample, 60)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            {/* Other texts */}
            {stats.otherTexts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">기타 입력</p>
                <div className="space-y-1 rounded-md bg-muted/40 p-3">
                  {stats.otherTexts.map((text, index) => (
                    <div key={`${text}-${index}`} className="text-xs text-muted-foreground">
                      • {truncate(text, 60)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface OptionBarProps {
  option: AggregatedOptionStat
  question: ReturnType<typeof getSurveyQuestionSummaries>[number]
}

function OptionBar({ option, question }: OptionBarProps) {
  const isRankChoice = question.questionType === "rank_choice"
  const percentage = option.percentage

  return (
    <div className="space-y-2 rounded-md border bg-background p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{option.displayValue}</span>
        <div className="flex items-baseline gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {NUMBER_FORMATTER.format(option.count)}건
          </span>
          <span>({formatPercentage(percentage)})</span>
        </div>
      </div>

      {/* 총점 막대 */}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* 순위형 추가 정보 */}
      {isRankChoice && (
        <div className="space-y-2 border-t pt-2">
          <div className="flex items-baseline gap-4 text-xs">
            {option.totalScore !== undefined && (
              <div>
                <span className="text-muted-foreground">총점:</span>{" "}
                <span className="font-semibold">{NUMBER_FORMATTER.format(option.totalScore)}</span>
              </div>
            )}
            {option.averageRank !== undefined && (
              <div>
                <span className="text-muted-foreground">평균 순위:</span>{" "}
                <span className="font-semibold text-amber-600">
                  {option.averageRank.toFixed(1)}위
                </span>
              </div>
            )}
          </div>

          {/* 순위별 분포 히스토그램 */}
          {option.rankDistribution && option.rankDistribution.some((count) => count > 0) && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">순위별 선택 횟수</p>
              <div className="flex gap-1">
                {option.rankDistribution.map((count, index) => {
                  const maxCount = Math.max(...option.rankDistribution!)
                  const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0
                  return (
                    <div key={index} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex h-12 w-full items-end">
                        <div
                          className="w-full rounded-t bg-amber-500/70 transition-all"
                          style={{ height: `${heightPercent}%` }}
                          title={`${index + 1}위: ${count}건`}
                        />
                      </div>
                      <div className="text-[10px] text-muted-foreground">{index + 1}</div>
                      <div className="text-[10px] font-medium">{count}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return "0%"
  }
  return `${PERCENT_FORMATTER.format(value)}%`
}

function truncate(value: string, max = 80) {
  if (value.length <= max) return value
  return `${value.slice(0, max)}...`
}
