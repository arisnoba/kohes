import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { currentAdmin, sameOrigin } from "@/lib/auth/server"
import { queryD1 } from "@/lib/d1/client"
import { verifyExportPassword } from "@/lib/d1/export-security"
import { BlobWriter, BlobReader, TextReader, ZipWriter } from "@zip.js/zip.js"

import { fetchSurveyResponsePayloads } from "@/lib/d1/responses"
import {
  buildOrderedExportData,
  convertToOrderedCSV,
  convertToExcel,
} from "@/lib/admin/export-utils"

type ExportType = "all" | "response" | "pii"
type ExportFormat = "csv" | "json" | "xlsx"

interface ExportRequest {
  type: ExportType
  format: ExportFormat
  password: string
}

export async function POST(request: Request) {
  try {
    const user = currentAdmin()
    if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    if (!sameOrigin(request))
      return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403 })
    const body = (await request.json()) as ExportRequest
    const { type, format, password } = body

    if (!["all", "response", "pii"].includes(type)) {
      return NextResponse.json({ error: "유효하지 않은 내보내기 타입입니다." }, { status: 400 })
    }

    if (!["csv", "json", "xlsx"].includes(format)) {
      return NextResponse.json({ error: "유효하지 않은 포맷입니다." }, { status: 400 })
    }

    if (!password) {
      return NextResponse.json({ error: "비밀번호를 입력해주세요." }, { status: 400 })
    }

    if (
      typeof password !== "string" ||
      password.length > 256 ||
      !(await verifyExportPassword(password))
    ) {
      return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 403 })
    }

    // 데이터 가져오기
    const { entries, error } = await fetchSurveyResponsePayloads(type !== "response")

    if (error) {
      console.error("데이터 조회 오류:", error)
      return NextResponse.json({ error: "데이터를 불러올 수 없습니다." }, { status: 500 })
    }

    // PII 데이터 내보내기 시 개인정보 비동의한 응답 제외
    let filteredEntries = entries
    if (type === "pii") {
      filteredEntries = entries.filter((entry) => {
        const name = entry.piiData?.name
        return !!entry.piiData && name !== "개인정보 비동의"
      })
    }

    // 순서대로 정렬된 데이터 생성 (한글 헤더 포함)
    const exportData = buildOrderedExportData(filteredEntries, type)

    // 파일 내용 생성
    let fileContent: string | Buffer
    let fileName: string
    const timestamp = new Date().toISOString().split("T")[0]

    if (format === "json") {
      fileContent = JSON.stringify(
        {
          data: exportData,
          count: exportData.length,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      )
      fileName = `kohes_survey_${type}_${timestamp}.json`
    } else if (format === "xlsx") {
      fileContent = await convertToExcel(exportData)
      fileName = `kohes_survey_${type}_${timestamp}.xlsx`
    } else {
      fileContent = convertToOrderedCSV(exportData)
      fileName = `kohes_survey_${type}_${timestamp}.csv`
    }

    // AES-256 암호화 ZIP 생성 (@zip.js/zip.js 사용)
    const zipWriter = new ZipWriter(new BlobWriter("application/zip"), {
      password,
      encryptionStrength: 3,
      level: 9,
    })

    // Buffer 또는 string을 적절한 Reader로 변환
    const reader =
      typeof fileContent === "string"
        ? new TextReader(fileContent)
        : new BlobReader(new Blob([fileContent]))

    await zipWriter.add(fileName, reader, {
      password,
      encryptionStrength: 3,
    })

    const zipBlob = await zipWriter.close()
    const zipArrayBuffer = await zipBlob.arrayBuffer()

    await queryD1([
      {
        sql: "INSERT INTO export_logs (id,user_id,export_type,export_format,response_count,created_at) VALUES (?,?,?,?,?,?)",
        params: [
          randomUUID(),
          user.id,
          type,
          format,
          filteredEntries.length,
          new Date().toISOString(),
        ],
      },
    ])

    // ZIP 파일 반환
    const zipBuffer = Buffer.from(zipArrayBuffer)
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="kohes_survey_${type}_${timestamp}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("내보내기 오류:", error)
    return NextResponse.json({ error: "내보내기에 실패했습니다." }, { status: 500 })
  }
}
