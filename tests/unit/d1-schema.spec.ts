import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { execFileSync } from "node:child_process"

const schema = readFileSync("d1/migrations/0001_survey_2026.sql", "utf8")
const insert = `INSERT INTO survey_responses
  (id, submission_key, payload_hash, survey_year, schema_version, submitted_at, response_data, created_at, updated_at)
  VALUES ('r1', 'key1', 'hash1', 2026, '2.0.0', '2026-10-07T00:00:00Z', '{"policyNeeds":{"difficultiesRank":["자금"]}}', '2026-10-07T00:00:00Z', '2026-10-07T00:00:00Z');`
function query(sql: string) {
  return execFileSync("sqlite3", ["-bail", "-json", ":memory:"], {
    input: schema + "\n" + sql,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim()
}

describe("2026 D1 SQLite schema", () => {
  it("stores Unicode JSON and keeps PII in a separate table", () => {
    const output = query(
      insert +
        `
      INSERT INTO survey_response_pii VALUES ('r1', '{"name":"테스트"}', '2027-10-07T00:00:00Z', '2026-10-07T00:00:00Z');
      SELECT json_extract(response_data, '$.policyNeeds.difficultiesRank[0]') AS answer FROM survey_responses;`
    )
    expect(JSON.parse(output)).toEqual([{ answer: "자금" }])
    const columns = JSON.parse(query("PRAGMA table_info(survey_responses);"))
    expect(columns.map((column: { name: string }) => column.name)).not.toContain("pii_data")
  })
  it("enforces a unique retry key", () => {
    expect(() => query(insert + insert.replace("'r1'", "'r2'"))).toThrow()
  })
  it("rejects invalid JSON, years and reward states", () => {
    expect(() =>
      query(insert.replace('\'{"policyNeeds":{"difficultiesRank":["자금"]}}\'', "'invalid-json'"))
    ).toThrow()
    expect(() => query(insert.replace(", 2026,", ", 2025,"))).toThrow()
    expect(() => query(insert + "UPDATE survey_responses SET reward_status = 'invalid';")).toThrow()
  })
  it("rejects orphaned personal data and rolls back an entire transaction", () => {
    expect(() =>
      query("INSERT INTO survey_response_pii VALUES ('missing', '{}', '2027-10-07', '2026-10-07');")
    ).toThrow()
    const output = query(
      "BEGIN;\n" + insert + "\nROLLBACK; SELECT count(*) AS count FROM survey_responses;"
    )
    expect(JSON.parse(output)).toEqual([{ count: 0 }])
  })
  it("allows refusal without a PII row and seeds no export password", () => {
    const output = query(
      insert +
        `UPDATE survey_responses SET reward_status = '추첨 대상 아님';
      SELECT (SELECT count(*) FROM survey_response_pii) AS pii_count,
        (SELECT count(*) FROM export_passwords) AS password_count,
        reward_status FROM survey_responses;`
    )
    expect(JSON.parse(output)).toEqual([
      { pii_count: 0, password_count: 0, reward_status: "추첨 대상 아님" },
    ])
  })
})
