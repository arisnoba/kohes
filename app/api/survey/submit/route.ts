import { validateSurveyData } from "@/lib/validation/survey-data"
import { NextResponse } from "next/server"

import { saveSurveyResponse } from "@/lib/d1/responses"

import type { SurveyData } from "@/components/survey/SurveyProvider"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const surveyData = body?.surveyData as SurveyData | undefined

    if (!surveyData) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
    }

    const validation = validateSurveyData(surveyData)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "설문 응답을 확인해주세요.", errors: validation.errors },
        { status: 400 }
      )
    }

    const key = body.submissionKey
    if (typeof key !== "string" || !/^[a-zA-Z0-9-]{16,100}$/.test(key)) {
      return NextResponse.json({ error: "제출 식별자가 필요합니다." }, { status: 400 })
    }
    const id = await saveSurveyResponse(surveyData, key)
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("설문 제출 처리 중 오류:", error)
    return NextResponse.json(
      { error: "설문 저장에 실패했습니다. 다시 시도해주세요." },
      { status: error instanceof Error && error.message === "SUBMISSION_CONFLICT" ? 409 : 500 }
    )
  }
}
