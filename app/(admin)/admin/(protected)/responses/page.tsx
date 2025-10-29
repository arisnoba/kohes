import { fetchSurveyResponses, isMissingTableError } from "@/lib/supabase/responses"
import type { RewardStatus } from "@/lib/supabase/responses"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

const DATE_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
})

export default async function ResponsesPage() {
  const { responses, error } = await fetchSurveyResponses()

  if (isMissingTableError(error)) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">응답 데이터 목록</h2>
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">survey_responses 테이블을 찾을 수 없습니다.</p>
          <p className="mt-2">Supabase CLI 로컬 DB 또는 원격 프로젝트에 아래 마이그레이션을 적용해주세요.</p>
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
        <h2 className="text-2xl font-bold">응답 데이터 목록</h2>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold">Supabase에서 데이터를 가져오는 중 오류가 발생했습니다.</p>
          <p className="mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  const hasResponses = responses.length > 0

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">응답 데이터 목록</h2>
        <p className="text-sm text-muted-foreground">
          Supabase `survey_responses` 테이블과 연결되어 리워드 발송 현황을 확인할 수 있습니다.
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
              <TableHead>메모</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasResponses ? (
              responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium text-foreground">{response.id}</TableCell>
                  <TableCell>{response.respondentName ?? "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {response.organizationName ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(response.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusToVariant(response.rewardStatus)}>
                      {response.rewardStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {response.rewardSentAt ? formatDate(response.rewardSentAt) : "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {response.rewardNote ?? "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  아직 저장된 응답이 없습니다. 설문 제출 후 이곳에 최신 응답이 표시됩니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        ※ 테이블 구조는 `supabase/migrations/20240127000000_create_survey_responses.sql`에서 확인할 수 있습니다.
      </p>
    </div>
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
