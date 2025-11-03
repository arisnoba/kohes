"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionText } from "@/components/survey/QuestionText"
import { QuestionSingleChoice } from "@/components/survey/QuestionSingleChoice"
import { QuestionMultiChoice } from "@/components/survey/QuestionMultiChoice"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { useSurveyForm } from "@/components/survey/SurveyProvider"
import type { ProjectDetailsState } from "@/components/survey/SurveyProvider"
import { useSurveyStepGuard } from "@/components/survey/useSurveyStepGuard"

export default function ProjectDetailsPage() {
  const router = useRouter()
  const { data, updateSection } = useSurveyForm()
  const { projectDetails } = data
  const [showErrors, setShowErrors] = useState(false)
  const canAccess = useSurveyStepGuard("project-details")

  useEffect(() => {}, [])

  if (!canAccess) {
    return null
  }

  const needsProjectInfo =
    projectDetails.expansionTiming === "2016.6 이전 진출" ||
    projectDetails.expansionTiming === "2016.6 이후 진출" ||
    projectDetails.expansionTiming === "진출 진행 중(법인 설립/현지 공사/인허가 진행 등)"

  const needsReportingAwareness2 =
    projectDetails.expansionTiming === "진출 기획/발굴 단계(시장조사 등)" ||
    projectDetails.expansionTiming === "기타"

  const validateTargetCountries = (value: string) => {
    if (!value.trim()) return "대상국을 입력해주세요."
    return null
  }

  const validateProjectName = (value: string) => {
    if (!value.trim()) return "사업명을 입력해주세요."
    return null
  }

  const handleNext = () => {
    setShowErrors(true)

    if (!projectDetails.expansionTiming) {
      toast.error("진출 시기를 선택해주세요.")
      setTimeout(() => {
        document
          .getElementById("expansion-timing")
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
      return
    }

    const targetCountriesError = validateTargetCountries(projectDetails.targetCountries)
    if (targetCountriesError) {
      setTimeout(() => {
        const element = document.getElementById("target-countries")
        element?.focus()
        element?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
      return
    }

    if (!projectDetails.expansionReason) {
      toast.error("진출 이유를 선택해주세요.")
      setTimeout(() => {
        document
          .getElementById("expansion-reason")
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
      return
    }

    if (projectDetails.services.length === 0) {
      toast.error("제공하는 서비스를 하나 이상 선택해주세요.")
      setTimeout(() => {
        document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
      return
    }

    if (needsProjectInfo) {
      const projectNameError = validateProjectName(projectDetails.projectName)
      if (projectNameError) {
        setTimeout(() => {
          const element = document.getElementById("project-name")
          element?.focus()
          element?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 100)
        return
      }
      if (!projectDetails.reportingAwareness1) {
        toast.error("신고 의무 인지 여부를 선택해주세요.")
        setTimeout(() => {
          document
            .getElementById("reporting-awareness-1")
            ?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 100)
        return
      }
    }

    if (needsReportingAwareness2 && !projectDetails.reportingAwareness2) {
      toast.error("신고 의무 인지 여부를 선택해주세요.")
      setTimeout(() => {
        document
          .getElementById("reporting-awareness-2")
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
      return
    }

    if (projectDetails.departments.length === 0) {
      toast.error("진출 진료과를 하나 이상 선택해주세요.")
      setTimeout(() => {
        document
          .getElementById("departments")
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
      return
    }

    if (!projectDetails.hasEvidence) {
      toast.error("증빙 자료 존재 여부를 선택해주세요.")
      setTimeout(() => {
        document
          .getElementById("has-evidence")
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
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
          <div className="border border-blue-200 rounded-md p-4 mt-4 bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-900">의료해외진출 범위</h3>
            <ol className="list-decimal pl-6 space-y-1 text-gray-700 mt-2">
              <li>
                국외 의료기관의 <b className="text-blue-800">개설․운영</b>
              </li>
              <li>
                국외 의료기관의 <b className="text-blue-800">수탁운영</b> 또는{" "}
                <b className="text-blue-800">운영에 대한 컨설팅</b>
              </li>
              <li>
                국외 의료기관에 대한 보건의료인 등 관련{" "}
                <b className="text-blue-800">종사자의 파견</b>
              </li>
              <li>
                국외 의료기관 또는 의료인에 대한{" "}
                <b className="text-blue-800">의료기술, 정보시스템 등의 이전</b>
              </li>
              <li>
                국외에서 보건의료서비스 제공에 필요한{" "}
                <b className="text-blue-800">의약품, 의료기기 등의 제공</b>
              </li>
              <li>
                국외 의료기관이나 의료인에게{" "}
                <b className="text-blue-800">의료지식이나 의료기술을 지원</b>하거나{" "}
                <b className="text-blue-800">교육</b>
                하는 것
              </li>
            </ol>
          </div>
        </div>

        <QuestionSingleChoice
          id="expansion-timing"
          label="귀 기관(회사)의 의료 해외진출 시기는 언제입니까?"
          description={
            <span className="text-red-500 font-medium">
              ※ 의료 해외진출 신고를 하지 않은 프로젝트만 기입해주십시오.
            </span>
          }
          required={true}
          options={[
            { value: "2016.6 이전 진출", label: "2016.6 이전 진출" },
            { value: "2016.6 이후 진출", label: "2016.6 이후 진출" },
            {
              value: "진출 진행 중(법인 설립/현지 공사/인허가 진행 등)",
              label: "진출 진행 중(법인 설립/현지 공사/인허가 진행 등)",
            },
            {
              value: "진출 기획/발굴 단계(시장조사 등)",
              label: "진출 기획/발굴 단계(시장조사 등)",
            },
            { value: "기타", label: "기타" },
          ]}
          value={projectDetails.expansionTiming}
          onChange={(value) => {
            const payload: Partial<ProjectDetailsState> = { expansionTiming: value }

            if (value === "진출 기획/발굴 단계(시장조사 등)" || value === "기타") {
              payload.projectName = ""
              payload.reportingAwareness1 = ""
            } else {
              payload.reportingAwareness2 = ""
            }

            updateSection("projectDetails", payload)
          }}
          otherValue={projectDetails.expansionTimingOther}
          onOtherChange={(value) => updateSection("projectDetails", { expansionTimingOther: value })}
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
          label="의료 해외진출을 하려는 목적은 무엇입니까?"
          required={true}
          options={[
            { value: "국내 경쟁 심화", label: "국내 경쟁 심화" },
            { value: "해외 파트너 요청", label: "해외 파트너 요청" },
            {
              value: "외국인환자 유치를 위한 거점 활용",
              label: "외국인환자 유치를 위한 거점 활용",
            },
            { value: "선교·자선", label: "선교·자선 활동의 목적" },
            { value: "기타", label: "기타" },
          ]}
          value={projectDetails.expansionReason}
          onChange={(value) => updateSection("projectDetails", { expansionReason: value })}
          otherValue={projectDetails.expansionReasonOther}
          onOtherChange={(value) => updateSection("projectDetails", { expansionReasonOther: value })}
        />

        <QuestionMultiChoice
          id="services"
          label="해외진출 사업에서 제공하는 서비스는 무엇입니까?"
          required={true}
          options={[
            { value: "개설운영_신설", label: "의료기관 개설·운영 (신설)" },
            { value: "개설운영_인수합병", label: "의료기관 개설·운영 (인수합병)" },
            { value: "수탁운영", label: "수탁운영" },
            { value: "컨설팅", label: "운영 컨설팅" },
            { value: "파견", label: "종사자 파견" },
            { value: "기술이전", label: "의료기술 이전" },
            { value: "정보시스템이전", label: "정보시스템 이전" },
            { value: "의약품제공", label: "국외 의료서비스 제공 위한 의약품 제공" },
            { value: "의료기기제공", label: "국외 의료서비스 제공 위한 의료기기 등 제공" },
            { value: "교육_국내", label: "의료인 교육 (국내 연수)" },
            { value: "교육_해외", label: "의료인 교육 (해외 방문연수)" },
            { value: "기타", label: "그 외 국제의료사업" },
          ]}
          value={projectDetails.services}
          onChange={(values) => updateSection("projectDetails", { services: values })}
          otherValue={projectDetails.servicesOther}
          onOtherChange={(value) => updateSection("projectDetails", { servicesOther: value })}
        />

        {needsProjectInfo && (
          <div className="space-y-6 rounded-lg border-2 border-purple-200 bg-purple-50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-purple-900">사업 정보</h3>
            </div>

            <QuestionText
              id="project-name"
              label="의료 해외진출 사업명은 무엇입니까?"
              placeholder="예: 아시아 의료진출 프로젝트"
              required={true}
              value={projectDetails.projectName}
              onChange={(value) => updateSection("projectDetails", { projectName: value })}
              validate={validateProjectName}
              error={
                showErrors
                  ? validateProjectName(projectDetails.projectName) || undefined
                  : undefined
              }
            />

            <QuestionSingleChoice
              id="reporting-awareness-1"
              label="의료법 제33조의2에 따른 해외진출 전 신고 의무를 알고 계십니까?"
              required={true}
              options={[
                { value: "예", label: "예" },
                { value: "아니오", label: "아니오" },
              ]}
              value={projectDetails.reportingAwareness1}
              onChange={(value) => updateSection("projectDetails", { reportingAwareness1: value })}
            />
          </div>
        )}

        {needsReportingAwareness2 && (
          <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-6">
            <QuestionSingleChoice
              id="reporting-awareness-2"
              label="의료 해외진출 시, 의료해외진출법 제4조에 의거하여 ‘의료 해외진출 신고’를 의무적으로 하여야 합니다. 해당 사실을 알고 계십니까?"
              required={true}
              options={[
                { value: "예", label: "예" },
                { value: "아니오", label: "아니오" },
              ]}
              value={projectDetails.reportingAwareness2}
              onChange={(value) => updateSection("projectDetails", { reportingAwareness2: value })}
            />
          </div>
        )}

        <QuestionMultiChoice
          id="departments"
          label="진출 진료과는 무엇입니까?"
          description={
            <span className="text-blue-500">
              의료인 교육, 정보시스템 이전 등 진료과에 해당하지 않는 경우엔 기타에 기입
            </span>
          }
          required={true}
          options={[
            { value: "내과", label: "내과" },
            { value: "외과", label: "외과" },
            { value: "산부인과", label: "산부인과" },
            { value: "소아청소년과", label: "소아청소년과" },
            { value: "정형외과", label: "정형외과" },
            { value: "신경외과", label: "신경외과" },
            { value: "정신건강의학과", label: "정신건강의학과" },
            { value: "안과", label: "안과" },
            { value: "이비인후과", label: "이비인후과" },
            { value: "피부과", label: "피부과" },
            { value: "비뇨의학과", label: "비뇨의학과" },
            { value: "영상의학과", label: "영상의학과" },
            { value: "방사선종양학과", label: "방사선종양학과" },
            { value: "병리과", label: "병리과" },
            { value: "진단검사의학과", label: "진단검사의학과" },
            { value: "결핵과", label: "결핵과" },
            { value: "재활의학과", label: "재활의학과" },
            { value: "성형외과", label: "성형외과" },
            { value: "마취통증의학과", label: "마취통증의학과" },
            { value: "응급의학과", label: "응급의학과" },
            { value: "기타", label: "기타" },
          ]}
          value={projectDetails.departments}
          onChange={(values) => updateSection("projectDetails", { departments: values })}
          otherValue={projectDetails.departmentsOther}
          onOtherChange={(value) => updateSection("projectDetails", { departmentsOther: value })}
        />

        <QuestionSingleChoice
          id="has-evidence"
          label="의료 해외진출을 증빙할 수 있는 계약서 혹은 기타 증빙서류가 있습니까?"
          description={
            <div className="border border-blue-200 rounded-md p-4 mt-4 bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-900">의료해외진출 증빙자료</h3>
              <ol className="list-decimal pl-6 space-y-1 text-gray-700 mt-2">
                <li>
                  <b>국외 의료기관의 개설․운영</b>
                  <br />
                  국외 의료기관 개설허가증, 국외법인 설립․인수 확인증 등
                </li>
                <li>
                  <b>그 외 의료해외진출의 경우</b>
                  <br />
                  관련 계약서 사본 (ex. 운영컨설팅 계약서, 연수 계약서, 연수 수료증 등)
                </li>
              </ol>
            </div>
          }
          required={true}
          options={[
            { value: "네", label: "네 (인허가서류, 계약서, 증명서 등)" },
            { value: "아니오", label: "아니오" },
          ]}
          value={projectDetails.hasEvidence}
          onChange={(value) => updateSection("projectDetails", { hasEvidence: value })}
        />

        <div className="mt-8">
          <NavigationButton onClick={handleNext}>다음</NavigationButton>
        </div>
      </div>
    </SurveyLayout>
  )
}
