import { currentAdmin } from "@/lib/auth/server"
import { createHash, randomUUID } from "node:crypto"
import { queryD1 } from "./client"
import { separatePIIData } from "@/lib/survey/submission"
import type { SurveyData } from "@/components/survey/SurveyProvider"
export type { AdminResponseSummary, SurveyResponseRecord } from "./types"
import type { AdminResponseSummary, SurveyResponseRecord } from "./types"
export interface StorageError {
  code: string
  message: string
}
export function isMissingTableError(error: StorageError | null) {
  return error?.message.includes("no such table") ?? false
}
const columns = "r.id, r.organization_name, r.submitted_at, r.response_data"
function mapRow(row: Record<string, unknown>): AdminResponseSummary {
  const responseData = JSON.parse(row.response_data as string)
  const piiData = row.pii_data ? JSON.parse(row.pii_data as string) : null
  return {
    id: String(row.id),
    submittedAt: String(row.submitted_at),
    organizationName: row.organization_name as string | null,
    respondentName: piiData?.name ?? null,
    responseData,
    piiData,
    orgType: responseData.expansionInfo?.orgType ?? null,
    expansionTiming: responseData.projectDetails?.expansionTiming ?? null,
  }
}
function storageError(error: unknown): StorageError {
  return { code: "D1", message: error instanceof Error ? error.message : "데이터 조회 실패" }
}
export async function fetchSurveyResponsesPage({ page = 1, pageSize = 20 } = {}) {
  try {
    if (!currentAdmin()) throw new Error("Admin authentication required")
    const [[count]] = await queryD1<{ count: number }>([
      { sql: "SELECT count(*) AS count FROM survey_responses" },
    ])
    const size = Number.isFinite(pageSize) ? Math.max(1, Math.min(500, Math.floor(pageSize))) : 20
    const current = Number.isFinite(page)
      ? Math.max(1, Math.min(Math.ceil(count.count / size) || 1, Math.floor(page)))
      : 1
    const [rows] = await queryD1([
      {
        sql: `SELECT ${columns}, p.pii_data FROM survey_responses r LEFT JOIN survey_response_pii p ON p.response_id=r.id ORDER BY r.submitted_at DESC,r.id DESC LIMIT ? OFFSET ?`,
        params: [size, (current - 1) * size],
      },
    ])
    return {
      responses: rows.map(mapRow),
      totalCount: count.count,
      page: current,
      pageSize: size,
      error: null,
    }
  } catch (error) {
    return { responses: [], totalCount: 0, page: 1, pageSize: 20, error: storageError(error) }
  }
}
export async function fetchSurveyResponsePayloads(includePII = false) {
  try {
    if (!currentAdmin()) throw new Error("Admin authentication required")
    const entries: SurveyResponseRecord[] = []
    let cursor: { submittedAt: string; id: string } | undefined
    while (true) {
      const [rows] = await queryD1([
        {
          sql: `SELECT ${columns}${includePII ? ", p.pii_data" : ""} FROM survey_responses r ${includePII ? "LEFT JOIN survey_response_pii p ON p.response_id=r.id" : ""} ${cursor ? "WHERE (r.submitted_at < ? OR (r.submitted_at = ? AND r.id < ?))" : ""} ORDER BY r.submitted_at DESC,r.id DESC LIMIT 500`,
          params: cursor ? [cursor.submittedAt, cursor.submittedAt, cursor.id] : [],
        },
      ])
      entries.push(...rows.map(mapRow))
      if (rows.length < 500) break
      cursor = entries[entries.length - 1]
    }
    return { entries, totalCount: entries.length, error: null }
  } catch (error) {
    return { entries: [], totalCount: 0, error: storageError(error) }
  }
}
export async function saveSurveyResponse(data: SurveyData, key: string) {
  const { responseData, piiData } = separatePIIData(data)
  const hash = createHash("sha256").update(JSON.stringify({ responseData, piiData })).digest("hex")
  const id = randomUUID(),
    now = new Date().toISOString()
  const retention = new Date()
  retention.setUTCFullYear(retention.getUTCFullYear() + 1)
  await queryD1([
    {
      sql: "INSERT INTO survey_responses (id,submission_key,payload_hash,survey_year,schema_version,submitted_at,organization_name,response_data,reward_status,created_at,updated_at) VALUES (?,?,?,2026,?,?,?,?,?,?,?) ON CONFLICT(submission_key) DO NOTHING",
      params: [
        id,
        key,
        hash,
        String(responseData.surveyVersion),
        now,
        responseData.expansionInfo.medicalOrgName || responseData.expansionInfo.companyName || null,
        JSON.stringify(responseData),
        piiData ? "발송 대기" : "추첨 대상 아님",
        now,
        now,
      ],
    },
    ...(piiData
      ? [
          {
            sql: "INSERT INTO survey_response_pii (response_id,pii_data,retention_until,created_at) SELECT id,?,?,? FROM survey_responses WHERE id=?",
            params: [JSON.stringify(piiData), retention.toISOString(), now, id],
          },
        ]
      : []),
  ])
  const [[saved]] = await queryD1<{ id: string; payload_hash: string }>([
    { sql: "SELECT id,payload_hash FROM survey_responses WHERE submission_key=?", params: [key] },
  ])
  if (saved.payload_hash !== hash) throw new Error("SUBMISSION_CONFLICT")
  return saved.id
}
