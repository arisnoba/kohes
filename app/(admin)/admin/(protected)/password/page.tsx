"use client"

import { useState } from "react"
import { Lock, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createSupabaseClient } from "@/lib/supabase/client"

export default function PasswordManagementPage() {
  const [loading, setLoading] = useState(false)
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

  const togglePasswordVisibility = (field: "old" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwords

    // 유효성 검사
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("모든 필드를 입력해주세요.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다.")
      return
    }

    if (newPassword.length < 8) {
      toast.error("비밀번호는 최소 8자 이상이어야 합니다.")
      return
    }

    setLoading(true)

    try {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("인증되지 않은 사용자입니다.")
      }

      // 비밀번호 변경 함수 호출
      const { data: success, error } = await supabase.rpc("update_export_password", {
        old_password: oldPassword,
        new_password: newPassword,
        user_id: user.id,
      })

      if (error) {
        console.error("비밀번호 변경 오류:", error)
        throw new Error("비밀번호 변경에 실패했습니다.")
      }

      if (!success) {
        throw new Error("현재 비밀번호가 올바르지 않습니다.")
      }

      toast.success("비밀번호가 성공적으로 변경되었습니다.")

      // 입력 필드 초기화
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("비밀번호 변경 오류:", error)
      toast.error(error instanceof Error ? error.message : "비밀번호 변경에 실패했습니다.")
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            비밀번호 변경
          </CardTitle>
          <CardDescription>
            보안을 위해 주기적으로 비밀번호를 변경하는 것을 권장합니다. 변경 후 ZIP 파일의 압축 해제 비밀번호도 동일하게 변경됩니다.
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
                {showPasswords.old ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
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
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
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

          <Button onClick={handleChangePassword} disabled={loading} className="w-full">
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

      {/* 보안 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>보안 지침</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 비밀번호는 최소 8자 이상으로 설정하세요.</p>
          <p>• 영문 대소문자, 숫자, 특수문자를 조합하여 사용하세요.</p>
          <p>• 다른 사람과 비밀번호를 공유하지 마세요.</p>
          <p>• 비밀번호 변경 시 관련 담당자에게 별도로 전달해야 합니다.</p>
          <p>• 초기 비밀번호는 &quot;export2025!@#&quot;이며 반드시 변경하세요.</p>
        </CardContent>
      </Card>
    </div>
  )
}

