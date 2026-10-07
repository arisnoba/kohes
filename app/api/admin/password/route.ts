import { NextResponse } from "next/server"
import { currentAdmin, sameOrigin } from "@/lib/auth/server"
import { updateExportPassword } from "@/lib/d1/export-security"
export async function POST(request: Request) {
  const user = currentAdmin()
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
  if (!sameOrigin(request))
    return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403 })
  try {
    const { oldPassword, newPassword } = await request.json()
    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      newPassword.length > 256 ||
      typeof oldPassword !== "string"
    )
      return NextResponse.json({ error: "비밀번호는 8~256자로 입력해주세요." }, { status: 400 })
    const success = await updateExportPassword(oldPassword, newPassword, user.id)
    return NextResponse.json({ success }, { status: success ? 200 : 403 })
  } catch {
    return NextResponse.json({ error: "비밀번호 변경 실패" }, { status: 500 })
  }
}
