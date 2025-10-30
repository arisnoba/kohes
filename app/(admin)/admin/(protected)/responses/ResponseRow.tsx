"use client"

import { useState } from "react"
import type { AdminResponseSummary, RewardStatus } from "@/lib/supabase/responses"
import { Badge } from "@/components/ui/badge"
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

interface ResponseRowProps {
  response: AdminResponseSummary
}

export function ResponseRow({ response }: ResponseRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setExpanded(!expanded)}>
        <TableCell className="text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}>
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
        <TableCell>
          <Badge variant={statusToVariant(response.rewardStatus)}>{response.rewardStatus}</Badge>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {response.rewardSentAt ? formatDate(response.rewardSentAt) : "-"}
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">{response.rewardNote ?? "-"}</TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={9} className="bg-muted/30 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">전체 응답 내용</h3>
                <p className="text-xs text-muted-foreground">
                  🔒 민감 정보는 마스킹 처리됩니다
                </p>
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

function statusToVariant(status: RewardStatus) {
  switch (status) {
    case "발송 완료":
      return "default" as const
    case "발송 대기":
      return "secondary" as const
    case "정보 확인 중":
      return "outline" as const
    default:
      return "secondary" as const
  }
}
