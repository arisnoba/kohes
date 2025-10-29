import { Fragment } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  type SurveyQuestionSummary,
  getSurveyQuestionSummaries
} from "@/lib/survey/schema-loader"

const QUESTION_TYPE_LABELS: Record<string, string> = {
  text: "단답형",
  textarea: "서술형",
  single_choice: "단일 선택",
  multi_choice: "복수 선택",
  rank_choice: "순위 선택"
}

export default function DashboardPage() {
  const summaries = getSurveyQuestionSummaries()
  const sections = groupBySection(summaries)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">설문 문항별 응답 관리</h2>
        <p className="text-sm text-muted-foreground">
          PRD와 스키마를 기준으로 정렬된 문항 목록입니다. 실제 응답 데이터는 Supabase 연동 후 자동으로 채워집니다.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[320px]">문항</TableHead>
              <TableHead className="w-[120px]">유형</TableHead>
              <TableHead className="w-[90px]">필수</TableHead>
              <TableHead>선택지 요약</TableHead>
              <TableHead className="min-w-[240px]">출현 조건</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <Fragment key={section.sectionId}>
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="bg-muted/60 text-sm font-semibold text-muted-foreground"
                  >
                    {section.sectionTitle}
                  </TableCell>
                </TableRow>
                {section.questions.map((question) => (
                  <TableRow key={`${question.sectionId}-${question.questionId}`}>
                    <TableCell className="space-y-1">
                      <div className="font-medium text-foreground">{question.questionLabel}</div>
                      <div className="text-xs text-muted-foreground">{question.questionId}</div>
                      {question.path.length > 0 ? (
                        <div className="text-xs text-muted-foreground">
                          경로: {question.path.join(" › ")}
                        </div>
                      ) : null}
                      {question.notes ? (
                        <div className="text-xs text-muted-foreground">비고: {question.notes}</div>
                      ) : null}
                      {question.help ? (
                        <div className="text-xs text-muted-foreground">도움말: {question.help}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {QUESTION_TYPE_LABELS[question.questionType] ?? question.questionType}
                      {question.questionType === "rank_choice" && question.rankCount ? (
                        <div className="text-xs text-muted-foreground">
                          순위 선택 {question.rankCount}개
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge variant={question.required ? "default" : "secondary"}>
                        {question.required ? "필수" : "선택"}
                      </Badge>
                      {question.allowDuplicates ? (
                        <div className="text-xs text-muted-foreground">중복 허용</div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatOptionPreview(question)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatCondition(question)}
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
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
        questions: []
      })
    }
    const index = lookup.get(summary.sectionId) ?? 0
    grouped[index]!.questions.push(summary)
  })

  return grouped
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
