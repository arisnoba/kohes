"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionText } from "@/components/survey/QuestionText"
import { QuestionSingleChoice } from "@/components/survey/QuestionSingleChoice"
import { QuestionMultiChoice } from "@/components/survey/QuestionMultiChoice"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { DevTools } from "@/components/survey/DevTools"

export default function ProjectDetailsPage() {
  const router = useRouter()
  const [skipValidation, setSkipValidation] = useState(false)

  // B1: 진출 시기
  const [expansionTiming, setExpansionTiming] = useState("")

  // B2: 대상국
  const [targetCountries, setTargetCountries] = useState("")

  // B3: 진출 이유
  const [expansionReason, setExpansionReason] = useState("")

  // B4: 제공 서비스
  const [services, setServices] = useState<string[]>([])

  // B5-1-1: 사업명 (B1이 이전/이후/진행중인 경우)
  const [projectName, setProjectName] = useState("")

  // B5-1-1-1: 신고 의무 인지 (B1이 이전/이후/진행중인 경우)
  const [reportingAwareness1, setReportingAwareness1] = useState("")

  // B5-2: 신고 의무 인지 (B1이 기획·발굴/기타인 경우)
  const [reportingAwareness2, setReportingAwareness2] = useState("")

  // B6: 진료과
  const [departments, setDepartments] = useState<string[]>([])

  // B7: 증빙 존재
  const [hasEvidence, setHasEvidence] = useState("")

  // 개발자 도구: 자동 채우기
  const handleAutoFill = () => {
    setExpansionTiming("2016.6 이후 진출")
    setTargetCountries("미국, 중국, 베트남")
    setExpansionReason("국내 경쟁 심화")
    setServices(["개설운영", "컨설팅"])
    setProjectName("아시아 의료진출 프로젝트")
    setReportingAwareness1("예")
    setDepartments(["내과", "외과"])
    setHasEvidence("네")
  }

  // B1 값에 따라 조건부 필드 결정
  const needsProjectInfo =
    expansionTiming === "2016.6 이전 진출" ||
    expansionTiming === "2016.6 이후 진출" ||
    expansionTiming === "진출 진행 중(계약완료 및 인허가 대기 등)"

  const needsReportingAwareness2 =
    expansionTiming === "진출 기획·발굴" || expansionTiming === "기타"

  const validateForm = () => {
    if (skipValidation) return true

    if (!expansionTiming) {
      alert("진출 시기를 선택해주세요.")
      return false
    }

    if (!targetCountries.trim()) {
      alert("대상국을 입력해주세요.")
      return false
    }

    if (!expansionReason) {
      alert("진출 이유를 선택해주세요.")
      return false
    }

    if (services.length === 0) {
      alert("제공하는 서비스를 하나 이상 선택해주세요.")
      return false
    }

    // B1이 이전/이후/진행중인 경우
    if (needsProjectInfo) {
      if (!projectName.trim()) {
        alert("사업명을 입력해주세요.")
        return false
      }
      if (!reportingAwareness1) {
        alert("신고 의무 인지 여부를 선택해주세요.")
        return false
      }
    }

    // B1이 기획·발굴/기타인 경우
    if (needsReportingAwareness2) {
      if (!reportingAwareness2) {
        alert("신고 의무 인지 여부를 선택해주세요.")
        return false
      }
    }

    if (!hasEvidence) {
      alert("증빙 자료 존재 여부를 선택해주세요.")
      return false
    }

    return true
  }

  const handleNext = () => {
    if (validateForm()) {
      router.push("/policy-needs")
    }
  }

  const handleBack = () => {
    router.push("/expansion-info")
  }

  const isFormValid =
    skipValidation ||
    (expansionTiming &&
      targetCountries.trim() &&
      expansionReason &&
      services.length > 0 &&
      ((needsProjectInfo && projectName.trim() && reportingAwareness1) ||
        (needsReportingAwareness2 && reportingAwareness2) ||
        (!needsProjectInfo && !needsReportingAwareness2)) &&
      hasEvidence)

  return (
    <SurveyLayout currentStep={3} totalSteps={5} onBack={handleBack} showBackButton={true}>
      <div className="space-y-8">
        {/* Section Title */}
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 3</div>
          <h2 className="text-xl font-bold text-gray-900">의료 해외진출 사업 세부정보</h2>
          <p className="mt-2 text-sm text-gray-500">
            아래는 의료 해외진출법에서 정의하고 있는 의료해외진출의 범위입니다.
          </p>
          <div
            className="
				border-2 border-gray-200 rounded-md p-4 mt-4 bg-white"
          >
            <h3 className="text-lg font-semibold text-gray-900">의료해외진출 범위</h3>
            <ol className="list-decimal pl-6 space-y-1 text-gray-700 mt-2">
              <li>국외 의료기관의 개설․운영</li>
              <li>국외 의료기관의 수탁운영 또는 운영에 대한 컨설팅</li>
              <li>국외 의료기관에 대한 보건의료인 등 관련 종사자의 파견</li>
              <li>국외 의료기관 또는 의료인에 대한 의료기술 또는 정보시스템 등의 이전</li>
              <li>국외에서 보건의료서비스 제공에 필요한 의약품, 의료기기 등의 제공</li>
              <li>국외 의료기관이나 의료인에게 의료지식이나 의료기술을 지원하거나 교육하는 것</li>
            </ol>
          </div>
        </div>

        {/* B1: 진출 시기 */}
        <QuestionSingleChoice
          id="expansion-timing"
          label="귀 기관(회사)의 의료 해외진출 시기는 언제입니까?"
          required={true}
          options={[
            { value: "2016.6 이전 진출", label: "2016.6 이전 진출" },
            { value: "2016.6 이후 진출", label: "2016.6 이후 진출" },
            {
              value: "진출 진행 중(계약완료 및 인허가 대기 등)",
              label: "진출 진행 중 (계약완료 및 인허가 대기 등)",
            },
            { value: "진출 기획·발굴", label: "진출 기획·발굴" },
            { value: "기타", label: "기타" },
          ]}
          value={expansionTiming}
          onChange={setExpansionTiming}
        />

        {/* B2: 대상국 */}
        <QuestionText
          id="target-countries"
          label="해외진출 대상국은 어디입니까?"
          placeholder="예: 미국, 중국, 베트남 (쉼표로 구분)"
          required={true}
          value={targetCountries}
          onChange={setTargetCountries}
        />

        {/* B3: 진출 이유 */}
        <QuestionSingleChoice
          id="expansion-reason"
          label="의료 해외진출을 하려는 목적은 무엇입니까?"
          required={true}
          options={[
            { value: "국내 경쟁 심화", label: "국내 경쟁 심화" },
            { value: "해외 파트너 요청", label: "해외 파트너 요청" },
            { value: "외국인환자 거점", label: "외국인환자 유치 거점 마련" },
            { value: "선교·자선", label: "선교·자선 활동의 목적" },
            { value: "기타", label: "기타" },
          ]}
          value={expansionReason}
          onChange={setExpansionReason}
        />

        {/* B4: 제공 서비스 */}
        <QuestionMultiChoice
          id="services"
          label="해외진출 사업에서 제공하는 서비스는 무엇입니까?"
          required={true}
          options={[
            { value: "개설운영_신설", label: "의료기관 개설·운영 (신설)" },
            { value: "개설운영_인수합병", label: "의료기관 개설·운영 (인수합병)" },
            { value: "수탁운영", label: "의료기관 수탁운영" },
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
          value={services}
          onChange={setServices}
        />

        {/* B5-1-1, B5-1-1-1: 사업명 및 신고 의무 (B1이 이전/이후/진행중) */}
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
              value={projectName}
              onChange={setProjectName}
            />

            <QuestionSingleChoice
              id="reporting-awareness-1"
              label="의료법 제33조의2에 따른 해외진출 전 신고 의무를 알고 계십니까?"
              required={true}
              options={[
                { value: "예", label: "예" },
                { value: "아니오", label: "아니오" },
              ]}
              value={reportingAwareness1}
              onChange={setReportingAwareness1}
            />
          </div>
        )}

        {/* B5-2: 신고 의무 (B1이 기획·발굴/기타) */}
        {needsReportingAwareness2 && (
          <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-6">
            <QuestionSingleChoice
              id="reporting-awareness-2"
              label="의료법 제33조의2에 따른 해외진출 전 신고 의무를 알고 계십니까?"
              required={true}
              options={[
                { value: "예", label: "예" },
                { value: "아니오", label: "아니오" },
              ]}
              value={reportingAwareness2}
              onChange={setReportingAwareness2}
            />
          </div>
        )}

        {/* B6: 진료과 */}
        <QuestionMultiChoice
          id="departments"
          label="진출 진료과는 무엇입니까?"
          required={false}
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
          value={departments}
          onChange={setDepartments}
        />

        {/* B7: 증빙 존재 */}
        <QuestionSingleChoice
          id="has-evidence"
          label="의료 해외진출을 증빙할 수 있는 계약서 혹은 기타 증빙서류가 있습니까?"
          required={true}
          options={[
            { value: "네", label: "네 (인허가서류, 계약서, 증명서 등)" },
            { value: "아니오", label: "아니오" },
          ]}
          value={hasEvidence}
          onChange={setHasEvidence}
        />

        {/* Navigation */}
        <div className="mt-8">
          <NavigationButton onClick={handleNext} disabled={!isFormValid}>
            다음
          </NavigationButton>
        </div>
      </div>

      {/* 개발자 도구 */}
      <DevTools onAutoFill={handleAutoFill} onSkipValidation={setSkipValidation} />
    </SurveyLayout>
  )
}
