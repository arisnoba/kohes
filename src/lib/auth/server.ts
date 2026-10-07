import { createHmac, timingSafeEqual, scryptSync, randomBytes } from "node:crypto"
import { cookies } from "next/headers"
export const COOKIE = "kohes_admin"
export function matches(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  return salt + ":" + scryptSync(password, salt, 64).toString("hex")
}
export function verifyPassword(password: string, hash: string) {
  const [salt, value] = hash.split(":")
  return !!salt && !!value && matches(scryptSync(password, salt, 64).toString("hex"), value)
}
function signature(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) throw new Error("Admin session configuration is missing")
  return createHmac("sha256", secret).update(value).digest("base64url")
}
export function createSession() {
  const value = Buffer.from(
    JSON.stringify({ email: process.env.ADMIN_EMAIL, expires: Date.now() + 8 * 60 * 60 * 1000 })
  ).toString("base64url")
  return value + "." + signature(value)
}
export function currentAdmin() {
  const token = cookies().get(COOKIE)?.value
  if (!token) return null
  try {
    const [value, sig] = token.split(".")
    if (!matches(signature(value), sig)) return null
    const body = JSON.parse(Buffer.from(value, "base64url").toString())
    if (body.expires <= Date.now() || body.email !== process.env.ADMIN_EMAIL) return null
    return { id: body.email, email: body.email, role: "admin" }
  } catch {
    return null
  }
}
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin
}
