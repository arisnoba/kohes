import { FileDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">데이터 내보내기</h2>
        <p className="text-sm text-muted-foreground">
          CSV 또는 JSON 형식으로 안전하게 데이터를 다운로드합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>다운로드 옵션</CardTitle>
          <CardDescription>민감 정보는 권한 검증 후에만 제공됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row">
          <Button className="gap-2">
            <FileDown className="h-4 w-4" />
            CSV 다운로드
          </Button>
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            JSON 다운로드
          </Button>
          <Button variant="outline" disabled className="gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            암호화된 ZIP (준비 중)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>내보내기 이력</CardTitle>
          <CardDescription>내보내기 요청 이력을 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>- PII 데이터는 별도 승인 절차 후 제공됩니다.</p>
          <p>- 요청 내역은 관리자 대시보드에서 추적할 수 있습니다.</p>
        </CardContent>
      </Card>
    </div>
  )
}
