export interface AuthUser {
  id: string
  email: string
  role?: string
}
export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/admin/auth", { cache: "no-store" })
  return (await response.json()).user
}
export async function signInWithPassword(email: string, password: string) {
  const response = await fetch("/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.error)
  return body
}
export async function signOut() {
  const response = await fetch("/api/admin/auth", { method: "DELETE" })
  if (!response.ok) throw new Error("로그아웃 실패")
}
