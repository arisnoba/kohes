import { fetchSurveyResponses, isMissingTableError } from "@/lib/supabase/responses"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ResponseRow } from "./ResponseRow"

const NUMBER_FORMATTER = new Intl.NumberFormat("ko-KR")

export default async function ResponsesPage() {
  const { responses, totalCount, error } = await fetchSurveyResponses()

  if (isMissingTableError(error)) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">응답 데이터 목록</h2>
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
        <p className="text-xs text-muted-foreground">
          총 {NUMBER_FORMATTER.format(totalCount)}건의 응답이 저장되었습니다.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">응답 ID</TableHead>
              <TableHead>응답자</TableHead>
              <TableHead>소속</TableHead>
              <TableHead>기관 유형</TableHead>
              <TableHead>진출 시기</TableHead>
              <TableHead>제출 시간</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasResponses ? (
              responses.map((response) => <ResponseRow key={response.id} response={response} />)
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  아직 저장된 응답이 없습니다. 설문 제출 후 이곳에 최신 응답이 표시됩니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        ※ 테이블 구조는 `supabase/migrations/20240127000000_create_survey_responses.sql`에서 확인할
        수 있습니다.
      </p>
    </div>
  )
}
