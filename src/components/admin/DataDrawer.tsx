"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import type { SurveyResponseRecord } from "@/lib/supabase/responses"

const NUMBER_FORMATTER = new Intl.NumberFormat("ko-KR")
const PERCENT_FORMATTER = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
})

interface QuestionDataDrawerProps {
  entries: SurveyResponseRecord[]
  questionId: string
  questionLabel: string
  triggerLabel?: string
  totalCount?: number
}

/**
 * 특정 문항의 모든 응답 데이터를 표시하는 Drawer 컴포넌트
 */
export function QuestionDataDrawer({
  entries,
  questionId,
  questionLabel,
  triggerLabel = "전체 보기",
  totalCount,
}: QuestionDataDrawerProps) {
  const [open, setOpen] = React.useState(false)
  const responseCount = totalCount ?? entries.length

  // 특정 문항의 데이터 추출
  const { dataItems, countryStats } = React.useMemo(() => {
    const items: Array<{ index: number; value: string; id: string }> = []
    const countryCounts = new Map<string, number>()

    entries.forEach((entry, index) => {
      const responseData = entry.responseData
      if (!responseData || typeof responseData !== "object") {
        return
      }

      let value: string | null = null

      // 문항 ID에 따라 데이터 경로 결정
      switch (questionId) {
        case "A2_org_name": {
          const expansionInfo = (responseData as any).expansionInfo
          value = expansionInfo?.medicalOrgName || null
          break
        }
        case "A3_company_name": {
          const expansionInfo = (responseData as any).expansionInfo
          value = expansionInfo?.companyName || null
          break
        }
        case "B2": {
          const projectDetails = (responseData as any).projectDetails
          const targetCountries = projectDetails?.targetCountries
          // 배열인 경우 쉼표로 조인, 문자열인 경우 그대로 사용
          if (Array.isArray(targetCountries)) {
            value = targetCountries.filter(Boolean).join(", ") || null
            // 국가별 집계
            targetCountries.forEach((country) => {
              if (typeof country === "string" && country.trim()) {
                const trimmed = country.trim()
                countryCounts.set(trimmed, (countryCounts.get(trimmed) || 0) + 1)
              }
            })
          } else if (typeof targetCountries === "string") {
            value = targetCountries || null
            // 콤마로 구분된 국가 파싱
            const countries = targetCountries
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
            countries.forEach((country) => {
              countryCounts.set(country, (countryCounts.get(country) || 0) + 1)
            })
          } else {
            value = null
          }
          break
        }
        case "B5_1_1": {
          const projectDetails = (responseData as any).projectDetails
          value = projectDetails?.projectName || null
          break
        }
        case "C3": {
          const policyNeeds = (responseData as any).policyNeeds
          value = policyNeeds?.desiredSupport || null
          break
        }
        case "C5": {
          const policyNeeds = (responseData as any).policyNeeds
          value = policyNeeds?.additionalComments || null
          break
        }
        default:
          return
      }

      if (typeof value === "string") {
        const trimmed = value.trim()
        if (trimmed) {
          items.push({ index, value: trimmed, id: entry.id })
        }
      }
    })

    // 국가별 통계 계산 (B2인 경우만)
    const totalCountrySelections = Array.from(countryCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    )
    const stats =
      questionId === "B2" && countryCounts.size > 0 && totalCountrySelections > 0
        ? Array.from(countryCounts.entries())
            .map(([country, count]) => ({
              country,
              count,
              percentage: (count / totalCountrySelections) * 100,
            }))
            .sort((a, b) => b.count - a.count)
        : []

    return { dataItems: items, countryStats: stats }
  }, [entries, questionId])

  const hasData = dataItems.length > 0
  const isB2 = questionId === "B2"

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="default" size="sm" className="h-8 text-xs shrink-0">
          {triggerLabel}
        </Button>
      </DrawerTrigger>
      <DrawerContent direction="right" className="flex flex-col">
        <DrawerHeader>
          <DrawerTitle>{questionLabel}</DrawerTitle>
          <DrawerDescription>
            {questionId} - 모든 응답 데이터를 확인할 수 있습니다.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 min-h-0">
          <div className="space-y-4 pb-4">
            {/* B2인 경우 국가별 통계 표시 */}
            {isB2 && countryStats.length > 0 && (
              <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                <h3 className="text-sm font-semibold">국가별 비율</h3>
                <div className="space-y-2">
                  {countryStats.map((stat) => (
                    <div key={stat.country} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stat.country}</span>
                        <span className="text-muted-foreground">
                          {NUMBER_FORMATTER.format(stat.count)}건 (
                          {PERCENT_FORMATTER.format(stat.percentage)}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasData ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                표시할 데이터가 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">전체 응답 목록</h3>
                {dataItems.map((item) => (
                  <Link
                    key={item.index}
                    href={`/admin/responses?highlight=${item.id}`}
                    className="block rounded-lg border bg-background p-3 space-y-1 transition-colors hover:bg-muted/50 hover:border-primary/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {responseCount - item.index}번 응답
                      </span>
                      <span className="text-xs text-primary">→ 상세보기</span>
                    </div>
                    <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                      {item.value}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <DrawerFooter>
          <div className="text-xs text-muted-foreground text-center">
            총 {NUMBER_FORMATTER.format(dataItems.length)}건의 데이터 표시 중
          </div>
          <DrawerClose asChild>
            <Button variant="outline">닫기</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
