import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { resolve } from "node:path"

const run = promisify(execFile)
export interface Statement {
  sql: string
  params?: (string | number | null)[]
}
export async function queryD1<T = Record<string, unknown>>(
  statements: Statement[]
): Promise<T[][]> {
  if (process.env.D1_LOCAL === "1") {
    if (process.env.NODE_ENV === "production") throw new Error("Local D1 is disabled in production")
    const sql = statements.map(({ sql, params = [] }) => {
      let index = 0
      return sql.replace(/\?/g, () => {
        const value = params[index++]
        if (value === undefined) throw new Error("Missing SQL parameter")
        return value === null
          ? "NULL"
          : typeof value === "number"
            ? String(value)
            : "'" + value.replace(/'/g, "''") + "'"
      })
    })
    const { stdout } = await run(
      "sqlite3",
      [
        "-json",
        resolve(".local/d1/kohes-survey-2026.sqlite"),
        "PRAGMA foreign_keys=ON; BEGIN; " + sql.join("; ") + "; COMMIT;",
      ],
      { maxBuffer: 32 * 1024 * 1024 }
    )
    return stdout.trim()
      ? stdout
          .trim()
          .split(/(?<=\])\s*(?=\[)/)
          .map((line) => JSON.parse(line))
      : statements.map(() => [])
  }
  const account = process.env.CLOUDFLARE_ACCOUNT_ID
  const database = process.env.CLOUDFLARE_D1_DATABASE_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!account || !database || !token) throw new Error("D1 server configuration is missing")
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(
        statements.length === 1
          ? { ...statements[0], params: statements[0].params ?? [] }
          : {
              batch: statements.map((statement) => ({
                ...statement,
                params: statement.params ?? [],
              })),
            }
      ),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    }
  )
  const body = await response.json()
  if (
    !response.ok ||
    !body.success ||
    !body.result?.every((item: { success: boolean }) => item.success)
  )
    throw new Error("D1 query failed")
  return body.result.map((item: { results: T[] }) => item.results)
}
