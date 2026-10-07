import { mkdirSync, readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { execFileSync } from "node:child_process"

// Fixed local path; this command cannot connect to Cloudflare or Supabase.
const directory = resolve(".local/d1")
const database = resolve(directory, "kohes-survey-2026.sqlite")
if (existsSync(database)) {
  throw new Error("로컬 DB가 이미 존재합니다. 초기화하거나 덮어쓰지 않습니다.")
}
mkdirSync(directory, { recursive: true })
const migration = readFileSync("d1/migrations/0001_survey_2026.sql", "utf8")
execFileSync("sqlite3", ["-bail", database], { input: migration })
const tables = execFileSync("sqlite3", [database, ".tables"], { encoding: "utf8" })
console.log(`로컬 DB 생성: ${database}`)
console.log(tables.trim())
