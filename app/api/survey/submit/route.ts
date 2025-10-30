import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/lib/supabase/client"
import { separatePIIData } from "@/lib/supabase/responses"
import type { SurveyData } from "@/components/survey/SurveyProvider"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const surveyData = body?.surveyData as SurveyData | undefined

    if (!surveyData) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const { piiData, responseData } = separatePIIData(surveyData)

    const respondentName = surveyData.basicInfo.name || null
    const organizationName =
      surveyData.expansionInfo.medicalOrgName || surveyData.expansionInfo.companyName || null

    const { data, error } = await supabase
      .from("survey_responses")
      .insert({
        respondent_name: respondentName,
        organization_name: organizationName,
        response_data: JSON.parse(JSON.stringify(responseData)),
        pii_data: JSON.parse(JSON.stringify(piiData)),
        is_completed: true,
      })
      .select("id")
      .single()

    if (error) {
      console.error("설문 제출 실패:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id ?? null })
  } catch (error) {
    console.error("설문 제출 처리 중 오류:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
