"use client"

import { MedicalExpansionScope } from "@/components/survey/MedicalExpansionScope"
import { useState, useEffect } from "react"
import { getQuestionOptions } from "@/lib/survey/schema-loader"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionText } from "@/components/survey/QuestionText"
import { QuestionSingleChoice } from "@/components/survey/QuestionSingleChoice"
import { QuestionMultiChoice } from "@/components/survey/QuestionMultiChoice"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { useSurveyForm } from "@/components/survey/SurveyProvider"
import { useSurveyStepGuard } from "@/components/survey/useSurveyStepGuard"

export default function ProjectDetailsPage() {
  const router = useRouter()
  const { data, updateSection, skipValidation } = useSurveyForm()
  const { projectDetails } = data
  const [showErrors, setShowErrors] = useState(false)
  const canAccess = useSurveyStepGuard("project-details")

  useEffect(() => {}, [])

  if (!canAccess) {
    return null
  }

  const validateTargetCountries = (value: string) => {
    if (!value.trim()) return "대상국을 입력해주세요."
    return null
  }

  const handleNext = () => {
    if (skipValidation) {
      router.push("/policy-needs")
      return
    }

    setShowErrors(true)

    if (!projectDetails.expansionTiming) {
      toast.error("진출 시기를 선택해주세요.")
      setTimeout(() => {
        const element = document.getElementById("expansion-timing")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    // "기타" 선택 시 입력값 필수 체크
    if (projectDetails.expansionTiming === "기타" && !projectDetails.expansionTimingOther?.trim()) {
      toast.error("진출 시기 '기타' 내용을 입력해주세요")
      setTimeout(() => {
        const element = document.getElementById("expansion-timing")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    const targetCountriesError = validateTargetCountries(projectDetails.targetCountries)
    if (targetCountriesError) {
      toast.error("해외진출 대상국을 입력해주세요.")
      setTimeout(() => {
        const element = document.getElementById("target-countries")
        if (element) {
          element.focus()
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    if (!projectDetails.expansionReason) {
      toast.error("진출 이유를 선택해주세요.")
      setTimeout(() => {
        const element = document.getElementById("expansion-reason")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    // "기타" 선택 시 입력값 필수 체크
    if (projectDetails.expansionReason === "기타" && !projectDetails.expansionReasonOther?.trim()) {
      toast.error("진출 이유 '기타' 내용을 입력해주세요")
      setTimeout(() => {
        const element = document.getElementById("expansion-reason")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    if (projectDetails.services.length === 0) {
      toast.error("제공하는 서비스를 하나 이상 선택해주세요.")
      setTimeout(() => {
        const element = document.getElementById("services")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    // "기타" 또는 "그 외 국제의료사업" 선택 시 입력값 필수 체크
    if (
      (projectDetails.services.includes("기타") ||
        projectDetails.services.includes("그 외 국제의료사업")) &&
      !projectDetails.servicesOther?.trim()
    ) {
      const selectedOption = projectDetails.services.includes("그 외 국제의료사업")
        ? "그 외 국제의료사업"
        : "기타"
      toast.error(`서비스 '${selectedOption}' 내용을 입력해주세요`)
      setTimeout(() => {
        const element = document.getElementById("services")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    if (!projectDetails.reportingAwareness1) {
      toast.error("신고 의무 인지 여부를 선택해주세요.")
      return
    }

    if (projectDetails.departments.length === 0) {
      toast.error("진출 진료과를 하나 이상 선택해주세요.")
      setTimeout(() => {
        const element = document.getElementById("departments")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    // "기타" 선택 시 입력값 필수 체크
    if (projectDetails.departments.includes("기타") && !projectDetails.departmentsOther?.trim()) {
      toast.error("진출 진료과 '기타' 내용을 입력해주세요")
      setTimeout(() => {
        const element = document.getElementById("departments")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    router.push("/policy-needs")
  }

  const handleBack = () => {
    router.push("/expansion-info")
  }

  return (
    <SurveyLayout currentStep={3} totalSteps={5} onBack={handleBack} showBackButton={true}>
      <div className="space-y-8">
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 3</div>
          <h2 className="text-2xl font-bold text-gray-900">의료 해외진출 사업 세부정보</h2>
          <p className="mt-2 text-sm text-gray-500">
            아래는 의료 해외진출법에서 정의하고 있는 의료해외진출의 범위입니다.
          </p>
          <MedicalExpansionScope />
        </div>

        <QuestionSingleChoice
          id="expansion-timing"
          label="귀 기관(회사)의 의료 해외진출 시기는 언제입니까?"
          description={
            <span className="text-red-500 font-medium leading-snug text-sm md:text-base">
              ※ 의료 해외진출 신고를 하지 않은 프로젝트만 기입해주십시오.
            </span>
          }
          required={true}
          options={getQuestionOptions("B", "B1")}
          value={projectDetails.expansionTiming}
          onChange={(value) => updateSection("projectDetails", { expansionTiming: value })}
          otherValue={projectDetails.expansionTimingOther}
          onOtherChange={(value) =>
            updateSection("projectDetails", { expansionTimingOther: value })
          }
        />

        <QuestionText
          id="target-countries"
          label="해외진출 대상국은 어디입니까?"
          placeholder="예: 미국, 중국, 베트남 (쉼표로 구분)"
          required={true}
          value={projectDetails.targetCountries}
          onChange={(value) => updateSection("projectDetails", { targetCountries: value })}
          validate={validateTargetCountries}
          error={
            showErrors
              ? validateTargetCountries(projectDetails.targetCountries) || undefined
              : undefined
          }
        />

        <QuestionSingleChoice
          id="expansion-reason"
          label="의료 해외진출을 추진했거나 추진하려는 주요 목적은 무엇입니까?"
          required={true}
          options={getQuestionOptions("B", "B3")}
          value={projectDetails.expansionReason}
          onChange={(value) => updateSection("projectDetails", { expansionReason: value })}
          otherValue={projectDetails.expansionReasonOther}
          onOtherChange={(value) =>
            updateSection("projectDetails", { expansionReasonOther: value })
          }
        />

        <QuestionMultiChoice
          id="services"
          label="추진 중인 해외 진출의 형태는 무엇입니까?"
          required={true}
          options={getQuestionOptions("B", "B4")}
          value={projectDetails.services}
          onChange={(values) => updateSection("projectDetails", { services: values })}
          otherValue={projectDetails.servicesOther}
          onOtherChange={(value) => updateSection("projectDetails", { servicesOther: value })}
        />

        <QuestionSingleChoice
          id="reporting-awareness-1"
          label="의료 해외진출 시, 의료해외진출법 제4조에 의거하여 ‘의료 해외진출 신고’를 의무적으로 하여야 합니다. 해당 사실을 알고 계십니까?"
          required={true}
          options={getQuestionOptions("B", "B5_1_1_1")}
          value={projectDetails.reportingAwareness1}
          onChange={(value) => updateSection("projectDetails", { reportingAwareness1: value })}
        />

        <QuestionMultiChoice
          id="departments"
          label="진출 진료과는 무엇입니까?"
          description={
            <span className="text-blue-500 leading-tight text-sm md:text-base">
              의료인 교육, 정보시스템 이전 등 진료과에 해당하지 않는 경우엔 기타에 기입
            </span>
          }
          required={true}
          options={getQuestionOptions("B", "B6")}
          value={projectDetails.departments}
          onChange={(values) => updateSection("projectDetails", { departments: values })}
          otherValue={projectDetails.departmentsOther}
          onOtherChange={(value) => updateSection("projectDetails", { departmentsOther: value })}
        />

        <div className="mt-8">
          <NavigationButton onClick={handleNext}>다음</NavigationButton>
        </div>
      </div>
    </SurveyLayout>
  )
}
