import { queryD1 } from "./client"
import { verifyPassword, hashPassword } from "@/lib/auth/server"
export async function verifyExportPassword(password: string) {
  const [[row]] = await queryD1<{ password_hash: string }>([
    { sql: "SELECT password_hash FROM export_passwords WHERE id='default'" },
  ])
  return !!row && verifyPassword(password, row.password_hash)
}
export async function updateExportPassword(
  oldPassword: string,
  newPassword: string,
  userId: string
) {
  const [[row]] = await queryD1<{ password_hash: string }>([
    { sql: "SELECT password_hash FROM export_passwords WHERE id='default'" },
  ])
  if (row && !verifyPassword(oldPassword, row.password_hash)) return false
  const hash = hashPassword(newPassword),
    now = new Date().toISOString()
  if (row) {
    const [updated] = await queryD1([
      {
        sql: "UPDATE export_passwords SET password_hash=?,updated_at=?,updated_by=? WHERE id='default' AND password_hash=? RETURNING id",
        params: [hash, now, userId, row.password_hash],
      },
    ])
    return updated.length === 1
  }
  const [inserted] = await queryD1([
    {
      sql: "INSERT INTO export_passwords (id,password_hash,updated_at,updated_by) VALUES ('default',?,?,?) ON CONFLICT(id) DO NOTHING RETURNING id",
      params: [hash, now, userId],
    },
  ])
  return inserted.length === 1
}
