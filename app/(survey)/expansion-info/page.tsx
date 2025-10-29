"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionText } from "@/components/survey/QuestionText"
import { QuestionSingleChoice } from "@/components/survey/QuestionSingleChoice"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { DevTools } from "@/components/survey/DevTools"
import { useSurveyForm } from "@/components/survey/SurveyProvider"

export default function ExpansionInfoPage() {
  const router = useRouter()
  const { data, updateSection } = useSurveyForm()
  const { expansionInfo } = data
  const [skipValidation, setSkipValidation] = useState(false)

  const handleOrgTypeChange = (value: string) => {
    if (value === "의료기관") {
      updateSection("expansionInfo", {
        orgType: value,
        companyName: "",
        companyCategory: ""
      })
    } else if (value === "회사") {
      updateSection("expansionInfo", {
        orgType: value,
        medicalOrgName: "",
        medicalOrgCategory: "",
        foundationType: "",
        legalType: ""
      })
    } else {
      updateSection("expansionInfo", { orgType: value })
    }
  }

  const handleFoundationTypeChange = (value: string) => {
    updateSection("expansionInfo", {
      foundationType: value,
      ...(value === "법인" ? {} : { legalType: "" })
    })
  }

  const handleAutoFill = () => {
    updateSection("expansionInfo", {
      orgType: "의료기관",
      medicalOrgName: "서울대학교병원",
      medicalOrgCategory: "상급종합병원",
      foundationType: "법인",
      legalType: "의료법인",
      companyName: "",
      companyCategory: ""
    })
  }

  const validateForm = () => {
    if (skipValidation) return true

    if (!expansionInfo.orgType) {
      alert("기관 구분을 선택해주세요.")
      return false
    }

    if (expansionInfo.orgType === "의료기관") {
      if (!expansionInfo.medicalOrgName.trim()) {
        alert("의료기관명을 입력해주세요.")
        return false
      }
      if (!expansionInfo.medicalOrgCategory) {
        alert("의료기관 구분을 선택해주세요.")
        return false
      }
      if (!expansionInfo.foundationType) {
        alert("설립구분을 선택해주세요.")
        return false
      }
      if (expansionInfo.foundationType === "법인" && !expansionInfo.legalType) {
        alert("법인 유형을 선택해주세요.")
        return false
      }
    }

    if (expansionInfo.orgType === "회사") {
      if (!expansionInfo.companyName.trim()) {
        alert("회사명을 입력해주세요.")
        return false
      }
      if (!expansionInfo.companyCategory) {
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
    (expansionInfo.orgType &&
      ((expansionInfo.orgType === "의료기관" &&
        expansionInfo.medicalOrgName.trim() &&
        expansionInfo.medicalOrgCategory &&
        expansionInfo.foundationType &&
        (expansionInfo.foundationType !== "법인" || expansionInfo.legalType)) ||
        (expansionInfo.orgType === "회사" &&
          expansionInfo.companyName.trim() &&
          expansionInfo.companyCategory)))

  return (
    <SurveyLayout currentStep={2} totalSteps={5} onBack={handleBack} showBackButton={true}>
      <div className="space-y-10">
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 2</div>
          <h2 className="text-xl font-bold text-gray-900">의료 해외진출 기본 정보</h2>
          <p className="mt-2 text-sm text-gray-500">귀하의 기관 정보를 입력해주세요</p>
        </div>

        <QuestionSingleChoice
          id="org-type"
          label="귀하의 기관 구분은 무엇입니까?"
          required={true}
          options={[
            { value: "의료기관", label: "의료기관" },
            { value: "회사", label: "회사 (MSO 등)" }
          ]}
          value={expansionInfo.orgType}
          onChange={handleOrgTypeChange}
        />

        {expansionInfo.orgType === "의료기관" && (
          <div className="space-y-6 rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-900">의료기관 정보</h3>
            </div>

            <QuestionText
              id="medical-org-name"
              label="의료기관명"
              placeholder="예: 서울대학교병원"
              required={true}
              value={expansionInfo.medicalOrgName}
              onChange={(value) =>
                updateSection("expansionInfo", { medicalOrgName: value })
              }
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
                { value: "상급종합병원", label: "상급종합병원" }
              ]}
              value={expansionInfo.medicalOrgCategory}
              onChange={(value) =>
                updateSection("expansionInfo", { medicalOrgCategory: value })
              }
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
                { value: "기타", label: "기타" }
              ]}
              value={expansionInfo.foundationType}
              onChange={handleFoundationTypeChange}
            />

            {expansionInfo.foundationType === "법인" && (
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
                  { value: "의료법인", label: "의료법인" }
                ]}
                value={expansionInfo.legalType}
                onChange={(value) => updateSection("expansionInfo", { legalType: value })}
              />
            )}
          </div>
        )}

        {expansionInfo.orgType === "회사" && (
          <div className="space-y-6 rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-emerald-900">회사 정보</h3>
            </div>

            <QuestionText
              id="company-name"
              label="회사명"
              placeholder="예: K-MSO"
              required={true}
              value={expansionInfo.companyName}
              onChange={(value) => updateSection("expansionInfo", { companyName: value })}
            />

            <QuestionSingleChoice
              id="company-category"
              label="회사 구분"
              required={true}
              options={[
                { value: "MSO", label: "MSO(병원경영지원회사)" },
                { value: "의료기기", label: "의료기기" },
                { value: "의약품", label: "의약품" },
                { value: "기타", label: "기타" }
              ]}
              value={expansionInfo.companyCategory}
              onChange={(value) =>
                updateSection("expansionInfo", { companyCategory: value })
              }
            />
          </div>
        )}

        <div className="mt-8">
          <NavigationButton onClick={handleNext} disabled={!isFormValid}>
            다음
          </NavigationButton>
        </div>
      </div>

      <DevTools onAutoFill={handleAutoFill} onSkipValidation={setSkipValidation} />
    </SurveyLayout>
  )
}
