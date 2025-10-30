import {
  fetchSurveyResponsesPage,
  isMissingTableError
} from "@/lib/supabase/responses"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { ResponseRow } from "./ResponseRow"

const NUMBER_FORMATTER = new Intl.NumberFormat("ko-KR")
const PAGE_SIZE = 20

interface ResponsesPageProps {
  searchParams?: Record<string, string | string[]>
}

export default async function ResponsesPage({ searchParams }: ResponsesPageProps = {}) {
  const currentPage = parsePage(searchParams?.page)
  const { responses, totalCount, page, pageSize, error } = await fetchSurveyResponsesPage({
    page: currentPage,
    pageSize: PAGE_SIZE
  })

  if (isMissingTableError(error)) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">응답 데이터 목록</h2>
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">survey_responses 테이블을 찾을 수 없습니다.</p>
          <p className="mt-2">Supabase CLI 로컬 DB 또는 원격 프로젝트에 아래 마이그레이션을 적용해주세요.</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>`supabase/migrations/20240127000000_create_survey_responses.sql` 파일을 확인합니다.</li>
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
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
  const paginationItems = createPaginationItems(page, pageCount)
  const baseNumber = totalCount - (page - 1) * pageSize

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
              <TableHead className="w-[80px] text-center">No.</TableHead>
              <TableHead className="w-[200px]">응답 ID</TableHead>
              <TableHead>응답자</TableHead>
              <TableHead>소속</TableHead>
              <TableHead>기관 유형</TableHead>
              <TableHead>진출 시기</TableHead>
              <TableHead>제출 시간</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasResponses ? (
              responses.map((response, index) => (
                <ResponseRow
                  key={response.id}
                  response={response}
                  order={Math.max(baseNumber - index, 1)}
                />
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

      {pageCount > 1 ? (
        <div className="flex items-center justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={createPageHref(page - 1, searchParams)}
                  aria-disabled={page <= 1}
                  className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
              {paginationItems.map((item, index) => {
                if (item === "ellipsis-left" || item === "ellipsis-right") {
                  return (
                    <PaginationItem key={`${item}-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                return (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href={createPageHref(item, searchParams)}
                      isActive={item === page}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  href={createPageHref(page + 1, searchParams)}
                  aria-disabled={page >= pageCount}
                  className={page >= pageCount ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        ※ 테이블 구조는 `supabase/migrations/20240127000000_create_survey_responses.sql`에서 확인할 수 있습니다.
      </p>
    </div>
  )
}

function parsePage(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1
  }
  return Math.floor(parsed)
}

function createPaginationItems(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const siblings = 1
  const leftSibling = Math.max(current - siblings, 1)
  const rightSibling = Math.min(current + siblings, total)
  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < total - 1
  const items: Array<number | "ellipsis-left" | "ellipsis-right"> = [1]

  if (!showLeftEllipsis) {
    for (let page = 2; page < leftSibling; page += 1) {
      items.push(page)
    }
  } else {
    items.push("ellipsis-left")
  }

  for (let page = leftSibling; page <= rightSibling; page += 1) {
    if (page !== 1 && page !== total) {
      items.push(page)
    }
  }

  if (!showRightEllipsis) {
    for (let page = rightSibling + 1; page < total; page += 1) {
      items.push(page)
    }
  } else {
    items.push("ellipsis-right")
  }

  if (total > 1) {
    items.push(total)
  }

  const seen = new Set<number | string>()
  return items.filter((item) => {
    if (typeof item === "number") {
      if (seen.has(item)) {
        return false
      }
      seen.add(item)
      return true
    }
    if (seen.has(item)) {
      return false
    }
    seen.add(item)
    return true
  })
}

function createPageHref(page: number, searchParams?: ResponsesPageProps["searchParams"]) {
  const params = new URLSearchParams()
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === "page") return
      if (Array.isArray(value)) {
        value.forEach((val) => {
          if (val !== undefined) {
            params.append(key, val)
          }
        })
      } else if (value !== undefined) {
        params.set(key, value)
      }
    })
  }

  if (page > 1) {
    params.set("page", String(page))
  }

  const query = params.toString()
  return query ? `?${query}` : ""
}
