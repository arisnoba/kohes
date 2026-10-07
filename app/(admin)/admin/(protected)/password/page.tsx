"use client"

import { useState } from "react"
import { Lock, Loader2, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"


export default function PasswordManagementPage() {
  const [loading, setLoading] = useState(false)
  const [dialogState, setDialogState] = useState<{
    open: boolean
    type: "success" | "error" | "validation"
    title: string
    message: string
  }>({
    open: false,
    type: "success",
    title: "",
    message: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  })
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const showDialog = (type: "success" | "error" | "validation", title: string, message: string) => {
    setDialogState({ open: true, type, title, message })
  }

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, open: false }))
  }

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChangePassword = async () => {
    const oldPassword = passwords.oldPassword.trim()
    const newPassword = passwords.newPassword.trim()
    const confirmPassword = passwords.confirmPassword.trim()

    // 유효성 검사
    if (!newPassword || !confirmPassword) {
      showDialog("validation", "입력 오류", "새 비밀번호와 확인 비밀번호를 입력해주세요.")
      return
    }

    if (newPassword !== confirmPassword) {
      showDialog("validation", "입력 오류", "새 비밀번호가 일치하지 않습니다.")
      return
    }

    if (newPassword.length < 8) {
      showDialog("validation", "입력 오류", "비밀번호는 최소 8자 이상이어야 합니다.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admin/password", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({oldPassword,newPassword})})
      const {success,error} = await response.json()
      if (error) throw new Error(error)

      if (!success) {
        showDialog(
          "error",
          "현재 비밀번호가 올바르지 않습니다",
          "입력하신 현재 비밀번호가 일치하지 않습니다."
        )
        return
      }

      showDialog("success", "변경 완료", "비밀번호가 성공적으로 변경되었습니다.")

      // 입력 필드 초기화
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("비밀번호 변경 오류:", error)
      showDialog(
        "error",
        "변경 실패",
        error instanceof Error ? error.message : "비밀번호 변경에 실패했습니다."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">내보내기 비밀번호 관리</h2>
        <p className="text-sm text-muted-foreground">
          데이터 내보내기 시 사용되는 비밀번호를 변경할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 w-full ">
        {/* 보안 안내 */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">보안 지침</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-red-900">
            <ul className="list-disc list-inside space-y-1">
              <li>보안을 위해 주기적으로 비밀번호를 변경하는 것을 권장합니다.</li>
              <li>ZIP 파일의 압축 해제 비밀번호도 동일하게 변경됩니다.</li>
              <li>
                비밀번호는 최소 8자 이상으로 영문 대소문자, 숫자, 특수문자를 조합하여 사용하세요.
              </li>
              <li>다른 사람과 비밀번호를 공유하지 마세요.</li>
              <li>비밀번호 변경 시 관련 담당자에게 안전한 채널로 전달하세요.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 mb-3">
              <Lock className="h-5 w-5" />
              비밀번호 변경
            </CardTitle>
            <CardDescription>
              변경 후 ZIP 파일의 압축 해제 비밀번호도 동일하게 변경됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 현재 비밀번호 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">현재 비밀번호</label>
              <div className="relative">
                <Input
                  type={showPasswords.old ? "text" : "password"}
                  placeholder="현재 비밀번호 입력"
                  value={passwords.oldPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, oldPassword: e.target.value }))
                  }
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("old")}
                  disabled={loading}
                >
                  {showPasswords.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* 새 비밀번호 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">새 비밀번호</label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="새 비밀번호 입력 (최소 8자)"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("new")}
                  disabled={loading}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">새 비밀번호 확인</label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="새 비밀번호 다시 입력"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) {
                      handleChangePassword()
                    }
                  }}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full hover:bg-transparent"
                  onClick={() => togglePasswordVisibility("confirm")}
                  disabled={loading}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button onClick={handleChangePassword} disabled={loading} className="w-full h-10">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  변경 중...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  비밀번호 변경
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 안내 Dialog (성공/에러/유효성 검사) */}
      <Dialog open={dialogState.open} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle
              className={`flex items-center gap-2 text-xl ${
                dialogState.type === "success"
                  ? "text-green-600"
                  : dialogState.type === "error"
                    ? "text-red-600"
                    : "text-amber-600"
              }`}
            >
              <Lock className="h-5 w-5" />
              {dialogState.title}
            </DialogTitle>
            <DialogDescription>{dialogState.message}</DialogDescription>
          </DialogHeader>

          {dialogState.type === "error" && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                <h3 className="font-semibold text-sm text-amber-900 mb-2">확인해주세요</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• 현재 비밀번호를 정확히 입력했는지 확인하세요.</li>
                  <li>• 대소문자를 구분하여 입력하세요.</li>
                  <li>• 처음 설정하는 경우 현재 비밀번호를 비워두세요.</li>
                </ul>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                <h3 className="font-semibold text-sm text-blue-900 mb-2">처음 설정하시나요?</h3>
                <p className="text-sm text-blue-800">
                  처음 비밀번호를 설정하는 경우 <strong>&ldquo;현재 비밀번호&rdquo;</strong> 필드는
                  비워두고 새 비밀번호만 입력하세요.
                </p>
              </div>
            </div>
          )}

          {dialogState.type === "success" && (
            <div className="py-4">
              <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                <p className="text-sm text-green-800">
                  변경된 비밀번호는 데이터 내보내기 시 ZIP 파일의 압축 해제에 사용됩니다. 안전한
                  곳에 보관하세요.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={closeDialog} className="w-full sm:w-auto">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
