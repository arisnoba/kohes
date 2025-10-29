import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AdminResponseRow {
  id: string
  respondent: string
  organization: string
  rewardStatus: "발송 완료" | "발송 대기" | "정보 확인 중"
  rewardSentAt?: Date
  submittedAt: Date
}

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  year: "2-digit",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

const MOCK_RESPONSES: AdminResponseRow[] = Array.from({ length: 24 }).map((_, index) => {
  const submittedAt = new Date()
  submittedAt.setMinutes(submittedAt.getMinutes() - index * 19)

  let rewardStatus: AdminResponseRow["rewardStatus"] = "발송 완료"
  let rewardSentAt: Date | undefined = new Date(submittedAt.getTime() + 15 * 60 * 1000)

  if (index % 4 === 0) {
    rewardStatus = "발송 대기"
    rewardSentAt = undefined
  } else if (index % 4 === 1) {
    rewardStatus = "정보 확인 중"
    rewardSentAt = undefined
  }

  return {
    id: `RESP-${202500 + index}`,
    respondent: `응답자 ${index + 1}`,
    organization: index % 3 === 0 ? "서울의료원" : index % 3 === 1 ? "K-MSO" : "해외진출지원단",
    rewardStatus,
    rewardSentAt,
    submittedAt,
  }
})

export default function ResponsesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">응답 데이터 목록</h2>
        <p className="text-sm text-muted-foreground">
          실제 응답 데이터가 연동되기 전까지는 모의 데이터가 표시됩니다. 리워드 발송 현황 중심으로
          컬럼이 구성되어 있습니다.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">응답 ID</TableHead>
              <TableHead className="w-[160px]">응답자</TableHead>
              <TableHead className="w-[200px]">소속</TableHead>
              <TableHead className="min-w-[160px]">제출 시간</TableHead>
              <TableHead className="w-[140px]">리워드 상태</TableHead>
              <TableHead className="w-[160px]">리워드 발송일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_RESPONSES.map((response) => (
              <TableRow key={response.id}>
                <TableCell className="font-medium text-foreground">{response.id}</TableCell>
                <TableCell>{response.respondent}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {response.organization}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {DATE_FORMATTER.format(response.submittedAt)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusToVariant(response.rewardStatus)}>
                    {response.rewardStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {response.rewardSentAt ? DATE_FORMATTER.format(response.rewardSentAt) : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        ※ 페이지네이션과 검색은 실제 데이터 연동 시 Supabase 쿼리에 맞춰 확장하세요.
      </p>
    </div>
  )
}

function statusToVariant(status: AdminResponseRow["rewardStatus"]) {
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
