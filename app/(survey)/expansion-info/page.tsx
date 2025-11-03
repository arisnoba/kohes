"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionText } from "@/components/survey/QuestionText"
import { QuestionSingleChoice } from "@/components/survey/QuestionSingleChoice"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { useSurveyForm } from "@/components/survey/SurveyProvider"
import { useSurveyStepGuard } from "@/components/survey/useSurveyStepGuard"

export default function ExpansionInfoPage() {
  const router = useRouter()
  const { data, updateSection } = useSurveyForm()
  const { expansionInfo } = data
  const [isMounted, setIsMounted] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const canAccess = useSurveyStepGuard("expansion-info")

  // 클라이언트 마운트 확인
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!canAccess) {
    return null
  }

  const handleOrgTypeChange = (value: string) => {
    if (value === "의료기관") {
      updateSection("expansionInfo", {
        orgType: value,
        companyName: "",
        companyCategory: "",
        companyCategoryOther: "",
      })
    } else if (value === "회사(MSO 등)") {
      updateSection("expansionInfo", {
        orgType: value,
        medicalOrgName: "",
        medicalOrgCategory: "",
        foundationType: "",
        legalType: "",
      })
    } else {
      updateSection("expansionInfo", { orgType: value })
    }
  }

  const handleFoundationTypeChange = (value: string) => {
    updateSection("expansionInfo", {
      foundationType: value,
      ...(value === "법인" ? {} : { legalType: "" }),
    })
  }

  // Validation functions
  const validateMedicalOrgName = (value: string) => {
    if (!value.trim()) return "의료기관명을 입력해주세요."
    return null
  }

  const validateCompanyName = (value: string) => {
    if (!value.trim()) return "회사명을 입력해주세요."
    return null
  }

  const handleNext = () => {
    // 기관 구분 체크
    if (!expansionInfo.orgType) {
      setShowErrors(true)
      toast.error("기관 구분을 선택해주세요.")
      setTimeout(() => {
        document.getElementById("org-type")?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
      return
    }

    // 의료기관 검증
    if (expansionInfo.orgType === "의료기관") {
      const medicalOrgNameError = validateMedicalOrgName(expansionInfo.medicalOrgName)

      if (
        medicalOrgNameError ||
        !expansionInfo.medicalOrgCategory ||
        !expansionInfo.foundationType
      ) {
        setShowErrors(true)

        if (medicalOrgNameError) {
          setTimeout(() => {
            const element = document.getElementById("medical-org-name")
            element?.focus()
            element?.scrollIntoView({ behavior: "smooth", block: "center" })
          }, 100)
        } else if (!expansionInfo.medicalOrgCategory) {
          toast.error("의료기관의 유형을 선택해주세요.")
          setTimeout(() => {
            document
              .getElementById("medical-org-category")
              ?.scrollIntoView({ behavior: "smooth", block: "center" })
          }, 100)
        } else if (!expansionInfo.foundationType) {
          toast.error("의료기관의 설립유형을 선택해주세요.")
          setTimeout(() => {
            document
              .getElementById("foundation-type")
              ?.scrollIntoView({ behavior: "smooth", block: "center" })
          }, 100)
        }
        return
      }

      if (expansionInfo.foundationType === "법인" && !expansionInfo.legalType) {
        toast.error("법인 유형을 선택해주세요.")
        setTimeout(() => {
          document
            .getElementById("legal-type")
            ?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 100)
        return
      }
    }

    // 회사 검증
    if (expansionInfo.orgType === "회사(MSO 등)") {
      const companyNameError = validateCompanyName(expansionInfo.companyName)

      if (companyNameError || !expansionInfo.companyCategory) {
        setShowErrors(true)

        if (companyNameError) {
          setTimeout(() => {
            const element = document.getElementById("company-name")
            element?.focus()
            element?.scrollIntoView({ behavior: "smooth", block: "center" })
          }, 100)
        } else if (!expansionInfo.companyCategory) {
          toast.error("회사 구분을 선택해주세요.")
          setTimeout(() => {
            document
              .getElementById("company-category")
              ?.scrollIntoView({ behavior: "smooth", block: "center" })
          }, 100)
        }
        return
      }

      // "기타" 선택 시 상세 입력 필수
      if (expansionInfo.companyCategory === "기타" && !expansionInfo.companyCategoryOther?.trim()) {
        setShowErrors(true)
        toast.error("기타 내용을 입력해주세요.")
        setTimeout(() => {
          document
            .getElementById("company-category")
            ?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 100)
        return
      }
    }

    router.push("/project-details")
  }

  const handleBack = () => {
    router.push("/basic-info")
  }

  return (
    <SurveyLayout currentStep={2} totalSteps={5} onBack={handleBack} showBackButton={true}>
      <div className="space-y-10">
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 2</div>
          <h2 className="text-2xl font-bold text-gray-900">의료 해외진출 기본 정보</h2>
          <p className="mt-2 text-sm text-gray-500">귀하의 기관 정보를 입력해주세요</p>
        </div>

        <QuestionSingleChoice
          id="org-type"
          label="귀하의 기관 구분은 무엇입니까?"
          required={true}
          options={[
            { value: "의료기관", label: "의료기관" },
            { value: "회사(MSO 등)", label: "회사 (MSO 등)" },
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
              label="의료기관명을 입력해 주세요."
              placeholder="예: 서울대학교병원"
              required={true}
              value={expansionInfo.medicalOrgName}
              onChange={(value) => updateSection("expansionInfo", { medicalOrgName: value })}
              validate={validateMedicalOrgName}
              error={
                showErrors
                  ? validateMedicalOrgName(expansionInfo.medicalOrgName) || undefined
                  : undefined
              }
            />

            <QuestionSingleChoice
              id="medical-org-category"
              label="의료기관의 유형을 선택해 주세요."
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
                { value: "종합병원(100~300병상)", label: "종합병원 (100~300병상)" },
                { value: "종합병원(300병상 초과)", label: "종합병원 (300병상 초과)" },
                { value: "상급종합병원", label: "상급종합병원" },
              ]}
              value={expansionInfo.medicalOrgCategory}
              onChange={(value) => updateSection("expansionInfo", { medicalOrgCategory: value })}
            />

            <QuestionSingleChoice
              id="foundation-type"
              label="의료기관의 설립 유형을 선택해 주세요."
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
              value={expansionInfo.foundationType}
              onChange={handleFoundationTypeChange}
              disableOtherInput={true}
            />

            {expansionInfo.foundationType === "법인" && (
              <QuestionSingleChoice
                id="legal-type"
                label="법인 유형"
                required={true}
                options={[
                  { value: "학교법인", label: "학교법인" },
                  { value: "특수법인", label: "특수법인" },
                  { value: "종교법인", label: "종교법인" },
                  { value: "사회복지법인", label: "사회복지법인" },
                  { value: "사단법인", label: "사단법인" },
                  { value: "재단법인", label: "재단법인" },
                  { value: "회사법인", label: "회사법인" },
                  { value: "의료법인", label: "의료법인" },
                ]}
                value={expansionInfo.legalType}
                onChange={(value) => updateSection("expansionInfo", { legalType: value })}
              />
            )}
          </div>
        )}

        {expansionInfo.orgType === "회사(MSO 등)" && (
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
              validate={validateCompanyName}
              error={
                showErrors ? validateCompanyName(expansionInfo.companyName) || undefined : undefined
              }
            />

            <QuestionSingleChoice
              id="company-category"
              label="회사 구분"
              required={true}
              options={[
                { value: "MSO(병원경영지원회사)", label: "MSO(병원경영지원회사)" },
                { value: "의료기기", label: "의료기기" },
                { value: "의약품", label: "의약품" },
                { value: "기타", label: "기타" },
              ]}
              value={expansionInfo.companyCategory}
              onChange={(value) => updateSection("expansionInfo", { companyCategory: value })}
              otherValue={expansionInfo.companyCategoryOther}
              onOtherChange={(value) =>
                updateSection("expansionInfo", { companyCategoryOther: value })
              }
            />
          </div>
        )}

        <div className="mt-8">
          <NavigationButton onClick={handleNext}>다음</NavigationButton>
        </div>
      </div>
    </SurveyLayout>
  )
}
