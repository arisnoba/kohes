import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  COOKIE,
  createSession,
  currentAdmin,
  matches,
  verifyPassword,
  sameOrigin,
} from "@/lib/auth/server"
export const dynamic = "force-dynamic"
const attempts = new Map<string, { count: number; reset: number }>()
export async function GET() {
  return NextResponse.json({ user: currentAdmin() }, { headers: { "Cache-Control": "no-store" } })
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403 })
  try {
    const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
    const now = Date.now()
    for (const [key, value] of attempts) if (value.reset <= now) attempts.delete(key)
    const attempt = attempts.get(address) || { count: 0, reset: now + 15 * 60 * 1000 }
    if (attempt.count >= 10)
      return NextResponse.json({ error: "잠시 후 다시 시도해주세요." }, { status: 429 })
    attempt.count++
    attempts.set(address, attempt)
    const { email, password } = await request.json()
    if (typeof email !== "string" || typeof password !== "string" || password.length > 256)
      return NextResponse.json({ error: "로그인 정보를 확인해주세요." }, { status: 400 })
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH)
      return NextResponse.json({ error: "관리자 설정이 필요합니다." }, { status: 503 })
    if (
      !matches(email, process.env.ADMIN_EMAIL) ||
      !verifyPassword(password, process.env.ADMIN_PASSWORD_HASH)
    )
      return NextResponse.json({ error: "로그인 정보가 올바르지 않습니다." }, { status: 401 })
    attempts.delete(address)
    cookies().set(COOKIE, createSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 28800,
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "로그인에 실패했습니다." }, { status: 500 })
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403 })
  cookies().delete(COOKIE)
  return NextResponse.json({ success: true })
}
