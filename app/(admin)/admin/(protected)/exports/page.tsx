"use client"

import { useState } from "react"
import { FileDown, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type ExportType = "all" | "response" | "pii"
type ExportFormat = "csv" | "json" | "xlsx"

interface PendingExport {
  type: ExportType
  format: ExportFormat
}

export default function ExportsPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [pendingExport, setPendingExport] = useState<PendingExport | null>(null)

  const handleExportClick = (type: ExportType, format: ExportFormat) => {
    setPendingExport({ type, format })
    setPassword("")
    setDialogOpen(true)
  }

  const handleExport = async () => {
    if (!pendingExport) return

    const { type, format } = pendingExport
    const loadingKey = `${type}-${format}`
    setLoading(loadingKey)

    try {
      if (!password) {
        throw new Error("비밀번호를 입력해주세요.")
      }

      // Supabase 클라이언트에서 액세스 토큰 가져오기
      const supabase = (await import("@/lib/supabase/client")).createSupabaseClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error("인증 세션이 없습니다. 다시 로그인해주세요.")
      }

      const response = await fetch("/api/admin/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type, format, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "내보내기에 실패했습니다.")
      }

      // ZIP 파일 다운로드
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `survey_${type}_${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("암호화된 ZIP 파일이 성공적으로 다운로드되었습니다.")
      setDialogOpen(false)
      setPassword("")
      setPendingExport(null)
    } catch (error) {
      console.error("내보내기 오류:", error)
      toast.error(error instanceof Error ? error.message : "내보내기에 실패했습니다.")
    } finally {
      setLoading(null)
    }
  }

  const isLoading = (type: ExportType, format: ExportFormat) => {
    return loading === `${type}-${format}`
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">데이터 내보내기</h2>
          <p className="text-sm text-muted-foreground">
            각 확장자 형식으로 안전하게 데이터를 다운로드합니다. 모든 파일은 AES-256으로 암호화된
            ZIP 형태로 제공됩니다.
          </p>
        </div>

        {/* 모든 데이터 내보내기 */}
        <Card>
          <CardHeader>
            <CardTitle>모든 데이터 내보내기</CardTitle>
            <CardDescription>
              응답 데이터와 개인정보(PII)를 모두 포함합니다. 민감한 정보가 포함되어 있으니
              주의하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="gap-2"
              onClick={() => handleExportClick("all", "xlsx")}
              disabled={loading !== null}
            >
              {isLoading("all", "xlsx") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Excel 다운로드
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleExportClick("all", "csv")}
              disabled={loading !== null}
            >
              {isLoading("all", "csv") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              CSV 다운로드
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleExportClick("all", "json")}
              disabled={loading !== null}
            >
              {isLoading("all", "json") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              JSON 다운로드
            </Button>
          </CardContent>
        </Card>

        {/* 문항 데이터 내보내기 */}
        <Card>
          <CardHeader>
            <CardTitle>문항 데이터 내보내기</CardTitle>
            <CardDescription>
              개인정보(PII)를 제외한 설문 응답 데이터만 포함합니다. 통계 분석에 적합합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="gap-2"
              onClick={() => handleExportClick("response", "xlsx")}
              disabled={loading !== null}
            >
              {isLoading("response", "xlsx") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Excel 다운로드
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleExportClick("response", "csv")}
              disabled={loading !== null}
            >
              {isLoading("response", "csv") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              CSV 다운로드
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleExportClick("response", "json")}
              disabled={loading !== null}
            >
              {isLoading("response", "json") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              JSON 다운로드
            </Button>
          </CardContent>
        </Card>

        {/* PII 데이터 내보내기 */}
        <Card>
          <CardHeader>
            <CardTitle>PII 데이터 내보내기</CardTitle>
            <CardDescription>
              개인식별정보(성명, 연락처, 이메일, 주소)만 포함합니다. 리워드 발송 시 사용하세요.
              <br />
              개인정보 수집에 동의하지 않은 응답은 자동으로 제외됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="gap-2"
              onClick={() => handleExportClick("pii", "xlsx")}
              disabled={loading !== null}
            >
              {isLoading("pii", "xlsx") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Excel 다운로드
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleExportClick("pii", "csv")}
              disabled={loading !== null}
            >
              {isLoading("pii", "csv") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              CSV 다운로드
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleExportClick("pii", "json")}
              disabled={loading !== null}
            >
              {isLoading("pii", "json") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              JSON 다운로드
            </Button>
          </CardContent>
        </Card>

        {/* 보안 안내 */}
        <Card>
          <CardHeader>
            <CardTitle>보안 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• 모든 파일은 AES-256 암호화된 ZIP 파일로 제공됩니다.</p>
            <p>• 다운로드 전 내보내기 비밀번호를 입력해야 합니다.</p>
            <p>• 다운로드한 ZIP 파일의 비밀번호는 별도로 안내드립니다.</p>
            <p>• 분석 목적으로는 &quot;문항 데이터&quot;를 사용하는 것을 권장합니다.</p>
          </CardContent>
        </Card>
      </div>

      {/* 비밀번호 입력 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              내보내기 비밀번호 입력
            </DialogTitle>
            <DialogDescription>
              데이터 내보내기를 위해 비밀번호를 입력해주세요. 이 비밀번호는 관리자에게 별도로 안내된
              비밀번호입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="내보내기 비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && password) {
                  handleExport()
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                setPassword("")
                setPendingExport(null)
              }}
              disabled={loading !== null}
            >
              취소
            </Button>
            <Button onClick={handleExport} disabled={!password || loading !== null}>
              {loading !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  다운로드 중...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  다운로드
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
