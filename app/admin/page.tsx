import { redirect } from "next/navigation"

export default function AdminPage() {
  // TODO: 인증 체크 로직 추가 후 대시보드로 리다이렉트
  // 현재는 바로 대시보드로 리다이렉트
  redirect("/admin/dashboard")
}
