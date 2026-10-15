"use client"

import { useRouter } from "next/navigation"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { useSurveyForm } from "@/components/survey/SurveyProvider"
import { QuestionSingleChoice } from "@/components/survey/QuestionSingleChoice"
import { MedicalExpansionScope } from "@/components/survey/MedicalExpansionScope"
import { getQuestionOptions } from "@/lib/survey/schema-loader"

export default function EligibilityPage() {
  const router = useRouter()
  const { data, updateSection } = useSurveyForm()
  return (
    <SurveyLayout currentStep={0} totalSteps={5} onBack={() => router.push("/intro")}>
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">0. 응답 대상 여부 확인</h2>
        <p className="text-gray-700">
          본 설문조사는 아래 사업을 수행하고 있거나 준비 중인 기관을 대상으로 합니다.
        </p>
        <MedicalExpansionScope />
        <QuestionSingleChoice
          id="eligible"
          label="귀 기관은 조사 대상에 해당합니까?"
          required={true}
          options={getQuestionOptions("eligibility", "eligible")}
          value={data.basicInfo.eligible}
          onChange={(value) => {
            updateSection("basicInfo", { eligible: value })
            if (value === "아니오") router.push("/complete")
          }}
        />
      </div>

      {data.basicInfo.eligible !== "아니오" && (
        <div className="mt-8">
          <NavigationButton
            disabled={data.basicInfo.eligible !== "예"}
            onClick={() => router.push("/consent")}
          >
            다음
          </NavigationButton>
        </div>
      )}
    </SurveyLayout>
  )
}
