import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { BlobWriter, BlobReader, TextReader, ZipWriter } from "@zip.js/zip.js"

import { createSupabaseServerClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import { fetchSurveyResponsePayloads } from "@/lib/supabase/responses"
import { buildOrderedExportData, convertToOrderedCSV, convertToExcel } from "@/lib/admin/export-utils"

type ExportType = "all" | "response" | "pii"
type ExportFormat = "csv" | "json" | "xlsx"

interface ExportRequest {
  type: ExportType
  format: ExportFormat
  password: string
}

export async function POST(request: Request) {
  try {
    // Authorization 헤더에서 액세스 토큰 가져오기
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "인증 토큰이 없습니다." }, { status: 401 })
    }

    // 토큰으로 사용자 확인
    const authClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    // 데이터 조회는 Service Role Key 사용
    const supabase = createSupabaseServerClient()

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

    // 비밀번호 검증
    const { data: isValid, error: verifyError } = await supabase.rpc("verify_export_password", {
      input_password: password,
    })

    if (verifyError || !isValid) {
      return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 403 })
    }

    // 데이터 가져오기
    const { entries, error } = await fetchSurveyResponsePayloads()

    if (error) {
      console.error("데이터 조회 오류:", error)
      return NextResponse.json({ error: "데이터를 불러올 수 없습니다." }, { status: 500 })
    }

    // PII 데이터 내보내기 시 개인정보 비동의한 응답 제외
    let filteredEntries = entries
    if (type === "pii") {
      filteredEntries = entries.filter((entry) => {
        const name = entry.piiData?.name
        return name !== "개인정보 비동의"
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
      fileName = `survey_${type}_${timestamp}.json`
    } else if (format === "xlsx") {
      fileContent = await convertToExcel(exportData)
      fileName = `survey_${type}_${timestamp}.xlsx`
    } else {
      fileContent = convertToOrderedCSV(exportData)
      fileName = `survey_${type}_${timestamp}.csv`
    }

    // AES-256 암호화 ZIP 생성 (@zip.js/zip.js 사용)
    const zipWriter = new ZipWriter(new BlobWriter("application/zip"), {
      password,
      encryptionStrength: 3,
      level: 9,
    })

    // Buffer 또는 string을 적절한 Reader로 변환
    const reader = typeof fileContent === "string"
      ? new TextReader(fileContent)
      : new BlobReader(new Blob([fileContent]))

    await zipWriter.add(fileName, reader, {
      password,
      encryptionStrength: 3,
    })

    const zipBlob = await zipWriter.close()
    const zipArrayBuffer = await zipBlob.arrayBuffer()

    // 로그 기록
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    await supabase.rpc("log_export", {
      p_user_id: user.id,
      p_export_type: type,
      p_export_format: format,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    })

    // ZIP 파일 반환
    const zipBuffer = Buffer.from(zipArrayBuffer)
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="survey_${type}_${timestamp}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("내보내기 오류:", error)
    return NextResponse.json({ error: "내보내기에 실패했습니다." }, { status: 500 })
  }
}


