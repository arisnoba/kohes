"use client"

import { getQuestionOptions } from "@/lib/survey/schema-loader"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionSingleChoice } from "@/components/survey/QuestionSingleChoice"
import { QuestionRankChoice } from "@/components/survey/QuestionRankChoice"
import { QuestionTextarea } from "@/components/survey/QuestionTextarea"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { useSurveyForm } from "@/components/survey/SurveyProvider"
import { useSurveyStepGuard } from "@/components/survey/useSurveyStepGuard"

export default function PolicyNeedsPage() {
  const router = useRouter()
  const { data, updateSection, skipValidation } = useSurveyForm()
  const { policyNeeds } = data
  const canAccess = useSurveyStepGuard("policy-needs")

  if (!canAccess) {
    return null
  }

  const handleNext = () => {
    if (skipValidation) {
      router.push("/complete")
      return
    }

    if (policyNeeds.difficultiesRank.length < 1 || policyNeeds.difficultiesRank.length > 3) {
      toast.error("어려움 순위를 1~3개 선택해주세요")
      setTimeout(() => {
        const element = document.getElementById("difficulties-rank")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    // "기타" 선택 시 입력값 필수 체크
    if (policyNeeds.difficultiesRank.includes("기타") && !policyNeeds.difficultiesOther?.trim()) {
      toast.error("어려움 순서의 '기타' 항목 내용을 입력해주세요.")
      setTimeout(() => {
        const element = document.getElementById("difficulties-rank")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    if (policyNeeds.supportNeedsRank.length < 1 || policyNeeds.supportNeedsRank.length > 3) {
      toast.error("지원 필요 순위를 1~3개 선택해주세요.")
      setTimeout(() => {
        const element = document.getElementById("support-needs-rank")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    // "기타" 선택 시 입력값 필수 체크
    if (policyNeeds.supportNeedsRank.includes("기타") && !policyNeeds.supportNeedsOther?.trim()) {
      toast.error("지원 필요 순위의 '기타' 항목 내용을 입력해주세요.")
      setTimeout(() => {
        const element = document.getElementById("support-needs-rank")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    if (!policyNeeds.awareness) {
      toast.error("KOHES 인지도를 선택해주세요.")
      setTimeout(() => {
        const element = document.getElementById("awareness")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    router.push("/complete")
  }

  const handleBack = () => {
    router.push("/project-details")
  }

  return (
    <SurveyLayout currentStep={4} totalSteps={5} onBack={handleBack} showBackButton={true}>
      <div className="space-y-10">
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 4</div>
          <h2 className="text-2xl font-bold text-gray-900">의료 해외진출 정책 요구도</h2>
          <p className="mt-2 text-sm text-gray-500">정책 지원에 대한 의견을 들려주세요</p>
        </div>

        <QuestionRankChoice
          id="difficulties-rank"
          label="의료 해외진출 사업을 추진하면서 겪었거나 현재 겪고 있는 주요 어려움은 무엇입니까?"
          required={true}
          maxRanks={3}
          minRequired={1}
          options={getQuestionOptions("C", "C1")}
          value={policyNeeds.difficultiesRank}
          onChange={(values) => updateSection("policyNeeds", { difficultiesRank: values })}
          otherValue={policyNeeds.difficultiesOther}
          onOtherChange={(value) => updateSection("policyNeeds", { difficultiesOther: value })}
        />

        <QuestionRankChoice
          id="support-needs-rank"
          label="의료 해외진출 활성화를 위해서 가장 필요한 정부 지원을 순서대로 선택해 주세요."
          required={true}
          maxRanks={3}
          minRequired={1}
          options={getQuestionOptions("C", "C2")}
          value={policyNeeds.supportNeedsRank}
          onChange={(values) => updateSection("policyNeeds", { supportNeedsRank: values })}
          otherValue={policyNeeds.supportNeedsOther}
          onOtherChange={(value) => updateSection("policyNeeds", { supportNeedsOther: value })}
        />

        <QuestionSingleChoice
          id="awareness"
          label="정부는 의료 해외진출에 대한 정보 등을 공유하기 위해 의료해외진출 종합정보포털(KOHES)을 운영하고 있습니다. KOHES를 방문하거나 들어본 적이 있으십니까?"
          required={true}
          options={getQuestionOptions("C", "C4")}
          value={policyNeeds.awareness}
          onChange={(value) => updateSection("policyNeeds", { awareness: value })}
        />

        <QuestionTextarea
          id="additional-comments"
          label="의료 해외진출을 활성화하기 위해 정부에 원하는 지원사항이 있으면 추가로 의견을 남겨주세요."
          placeholder="자유롭게 의견을 작성해주세요."
          value={policyNeeds.additionalComments}
          onChange={(value) => updateSection("policyNeeds", { additionalComments: value })}
        />

        <div className="mt-8">
          <NavigationButton onClick={handleNext}>제출</NavigationButton>
        </div>
      </div>
    </SurveyLayout>
  )
}
