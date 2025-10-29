import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/60 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle>관리자 로그인</CardTitle>
          <CardDescription>권한이 있는 사용자만 접근할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4">
            <div className="space-y-2 text-left">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                이메일
              </label>
              <Input id="email" type="email" placeholder="admin@kohes.or.kr" autoComplete="email" />
            </div>
            <div className="space-y-2 text-left">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                비밀번호
              </label>
              <Input id="password" type="password" autoComplete="current-password" />
            </div>
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
          <div className="text-center text-xs text-muted-foreground">
            <p>접속 문제는 시스템 관리자에게 문의하세요.</p>
            <Link href="/" className="text-primary underline-offset-4 hover:underline">
              설문 홈으로 이동
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
