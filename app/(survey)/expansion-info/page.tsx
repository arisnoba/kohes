"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionText } from "@/components/survey/QuestionText"
import { QuestionSingleChoice } from "@/components/survey/QuestionSingleChoice"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { DevTools } from "@/components/survey/DevTools"

export default function ExpansionInfoPage() {
  const router = useRouter()
  const [skipValidation, setSkipValidation] = useState(false)

  // A1: 구분
  const [orgType, setOrgType] = useState("")

  // A2: 의료기관 그룹
  const [medicalOrgName, setMedicalOrgName] = useState("")
  const [medicalOrgCategory, setMedicalOrgCategory] = useState("")
  const [foundationType, setFoundationType] = useState("")
  const [legalType, setLegalType] = useState("")

  // A3: 회사 그룹
  const [companyName, setCompanyName] = useState("")
  const [companyCategory, setCompanyCategory] = useState("")

  // 개발자 도구: 자동 채우기
  const handleAutoFill = () => {
    setOrgType("의료기관")
    setMedicalOrgName("서울대학교병원")
    setMedicalOrgCategory("상급종합병원")
    setFoundationType("법인")
    setLegalType("의료법인")
  }

  const validateForm = () => {
    if (skipValidation) return true

    if (!orgType) {
      alert("기관 구분을 선택해주세요.")
      return false
    }

    // A1이 의료기관인 경우
    if (orgType === "의료기관") {
      if (!medicalOrgName.trim()) {
        alert("의료기관명을 입력해주세요.")
        return false
      }
      if (!medicalOrgCategory) {
        alert("의료기관 구분을 선택해주세요.")
        return false
      }
      if (!foundationType) {
        alert("설립구분을 선택해주세요.")
        return false
      }
      // 설립구분이 법인인 경우 법인 유형 필수
      if (foundationType === "법인" && !legalType) {
        alert("법인 유형을 선택해주세요.")
        return false
      }
    }

    // A1이 회사인 경우
    if (orgType === "회사") {
      if (!companyName.trim()) {
        alert("회사명을 입력해주세요.")
        return false
      }
      if (!companyCategory) {
        alert("회사 구분을 선택해주세요.")
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    if (validateForm()) {
      router.push("/project-details")
    }
  }

  const handleBack = () => {
    router.push("/basic-info")
  }

  const isFormValid =
    skipValidation ||
    (orgType &&
      ((orgType === "의료기관" &&
        medicalOrgName.trim() &&
        medicalOrgCategory &&
        foundationType &&
        (foundationType !== "법인" || legalType)) ||
        (orgType === "회사" && companyName.trim() && companyCategory)))

  return (
    <SurveyLayout currentStep={2} totalSteps={5} onBack={handleBack} showBackButton={true}>
      <div className="space-y-8">
        {/* Section Title */}
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 2</div>
          <h2 className="text-xl font-bold text-gray-900">의료 해외진출 기본 정보</h2>
          <p className="mt-2 text-sm text-gray-500">귀하의 기관 정보를 입력해주세요</p>
        </div>

        {/* A1: 구분 */}
        <QuestionSingleChoice
          id="org-type"
          label="귀하의 기관 구분은 무엇입니까?"
          required={true}
          options={[
            { value: "의료기관", label: "의료기관" },
            { value: "회사", label: "회사 (MSO 등)" },
          ]}
          value={orgType}
          onChange={setOrgType}
        />

        {/* A2 그룹: 의료기관 (show_if A1=의료기관) */}
        {orgType === "의료기관" && (
          <div className="space-y-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-900">의료기관 정보</h3>
            </div>

            <QuestionText
              id="medical-org-name"
              label="의료기관명"
              placeholder="예: 서울대학교병원"
              required={true}
              value={medicalOrgName}
              onChange={setMedicalOrgName}
            />

            <QuestionSingleChoice
              id="medical-org-category"
              label="의료기관 구분"
              required={true}
              options={[
                { value: "의원", label: "의원" },
                { value: "치과의원", label: "치과의원" },
                { value: "한의원", label: "한의원" },
                { value: "조산원", label: "조산원" },
                { value: "병원", label: "병원" },
                { value: "치과병원", label: "치과병원" },
                { value: "한방병원", label: "한방병원" },
                { value: "요양병원", label: "요양병원" },
                { value: "종합병원(100~300)", label: "종합병원 (100~300병상)" },
                { value: "종합병원(300+)", label: "종합병원 (300병상 이상)" },
                { value: "상급종합병원", label: "상급종합병원" },
              ]}
              value={medicalOrgCategory}
              onChange={setMedicalOrgCategory}
            />

            <QuestionSingleChoice
              id="foundation-type"
              label="설립구분"
              required={true}
              options={[
                { value: "국공립", label: "국공립" },
                { value: "법인", label: "법인" },
                { value: "소비자생활협동조합", label: "소비자생활협동조합" },
                { value: "사회적협동조합", label: "사회적협동조합" },
                { value: "개인", label: "개인" },
                { value: "군병원", label: "군병원" },
                { value: "기타", label: "기타" },
              ]}
              value={foundationType}
              onChange={setFoundationType}
            />

            {/* 법인 유형 (show_if 설립=법인) */}
            {foundationType === "법인" && (
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                <QuestionSingleChoice
                  id="legal-type"
                  label="법인 유형"
                  required={true}
                  options={[
                    { value: "학교", label: "학교법인" },
                    { value: "특수", label: "특수법인" },
                    { value: "종교", label: "종교법인" },
                    { value: "사회복지", label: "사회복지법인" },
                    { value: "사단", label: "사단법인" },
                    { value: "재단", label: "재단법인" },
                    { value: "회사", label: "회사법인" },
                    { value: "의료법인", label: "의료법인" },
                  ]}
                  value={legalType}
                  onChange={setLegalType}
                />
              </div>
            )}
          </div>
        )}

        {/* A3 그룹: 회사 (show_if A1=회사) */}
        {orgType === "회사" && (
          <div className="space-y-6 rounded-lg border-2 border-green-200 bg-green-50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-green-900">회사 정보</h3>
            </div>

            <QuestionText
              id="company-name"
              label="회사명"
              placeholder="예: ㈜헬스케어코리아"
              required={true}
              value={companyName}
              onChange={setCompanyName}
            />

            <QuestionSingleChoice
              id="company-category"
              label="구분"
              required={true}
              options={[
                { value: "MSO", label: "MSO (병원경영지원회사)" },
                { value: "의료기기", label: "의료기기" },
                { value: "의약품", label: "의약품" },
                { value: "기타", label: "기타" },
              ]}
              value={companyCategory}
              onChange={setCompanyCategory}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="sticky bottom-6">
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
