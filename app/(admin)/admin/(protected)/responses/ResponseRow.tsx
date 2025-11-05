"use client"

import { useState, useEffect, useRef } from "react"
import type { AdminResponseSummary } from "@/lib/supabase/responses"
import { TableCell, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResponseDetailView } from "./ResponseDetailView"

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})
const NUMBER_FORMATTER = new Intl.NumberFormat("ko-KR")

interface ResponseRowProps {
  response: AdminResponseSummary
  order: number
  highlightId?: string
}

export function ResponseRow({ response, order, highlightId }: ResponseRowProps) {
  const [expanded, setExpanded] = useState(false)
  const rowRef = useRef<HTMLTableRowElement>(null)
  const isHighlighted = highlightId === response.id

  // 하이라이트된 응답이면 자동으로 펼치고 스크롤
  useEffect(() => {
    if (isHighlighted) {
      setExpanded(true)
      // 약간의 지연 후 스크롤 (DOM 렌더링 대기)
      setTimeout(() => {
        rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
    }
  }, [isHighlighted])

  return (
    <>
      <TableRow
        ref={rowRef}
        className={`cursor-pointer hover:bg-muted/50 transition-colors ${
          isHighlighted ? "bg-blue-50" : ""
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="text-center text-xs text-muted-foreground">
          {NUMBER_FORMATTER.format(order)}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {response.id}
          </div>
        </TableCell>
        <TableCell>{response.respondentName ?? "-"}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {response.organizationName ?? "-"}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">{response.orgType ?? "-"}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {response.expansionTiming ?? "-"}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {formatDate(response.submittedAt)}
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/30 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">전체 응답 내용</h3>
                {/* <p className="text-xs text-red-500">민감 정보는 마스킹 처리됩니다.</p> */}
              </div>
              <div className="rounded-lg border bg-background p-4">
                <ResponseDetailView response={response} />
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

function formatDate(value: string | null) {
  if (!value) return "-"
  return DATE_FORMATTER.format(new Date(value))
}
