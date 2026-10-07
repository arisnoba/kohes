"use client"

import { useState, useEffect } from "react"
import { getQuestionOptions } from "@/lib/survey/schema-loader"
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
  const { data, updateSection, skipValidation } = useSurveyForm()
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
    } else if (value === "회사(의약품, 의료기기 화장품, MSO 등)") {
      updateSection("expansionInfo", {
        orgType: value,
        medicalOrgName: "",
        medicalOrgCategory: "",
        foundationType: "",
        legalType: "",
        legalName: "",
        legalTypeOther: "",
        foundationTypeOther: "",
        medicalOrgCategoryOther: "",
      })
    } else {
      updateSection("expansionInfo", { orgType: value })
    }
  }

  const handleFoundationTypeChange = (value: string) => {
    updateSection("expansionInfo", {
      foundationType: value,
      ...(value === "법인" ? {} : { legalType: "", legalName: "", legalTypeOther: "" }),
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
    if (skipValidation) {
      router.push("/project-details")
      return
    }

    // 기관 구분 체크
    if (!expansionInfo.orgType) {
      setShowErrors(true)
      toast.error("기관 구분을 선택해주세요.")
      setTimeout(() => {
        const element = document.getElementById("org-type")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
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
            if (element) {
              element.focus()
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
              const offsetPosition = elementPosition - 100
              window.scrollTo({ top: offsetPosition, behavior: "smooth" })
            }
          }, 100)
        } else if (!expansionInfo.medicalOrgCategory) {
          toast.error("의료기관의 유형을 선택해주세요.")
          setTimeout(() => {
            const element = document.getElementById("medical-org-category")
            if (element) {
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
              const offsetPosition = elementPosition - 100
              window.scrollTo({ top: offsetPosition, behavior: "smooth" })
            }
          }, 100)
        } else if (!expansionInfo.foundationType) {
          toast.error("의료기관의 설립유형을 선택해주세요.")
          setTimeout(() => {
            const element = document.getElementById("foundation-type")
            if (element) {
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
              const offsetPosition = elementPosition - 100
              window.scrollTo({ top: offsetPosition, behavior: "smooth" })
            }
          }, 100)
        }
        return
      }

      if (expansionInfo.foundationType === "법인" && !expansionInfo.legalType) {
        toast.error("법인 유형을 선택해주세요.")
        setTimeout(() => {
          const element = document.getElementById("legal-type")
          if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
            const offsetPosition = elementPosition - 100
            window.scrollTo({ top: offsetPosition, behavior: "smooth" })
          }
        }, 100)
        return
      }
    }

    if (expansionInfo.orgType === "의료기관") {
      const missingOther = [
        [expansionInfo.medicalOrgCategory, expansionInfo.medicalOrgCategoryOther],
        [expansionInfo.foundationType, expansionInfo.foundationTypeOther],
        ...(expansionInfo.foundationType === "법인"
          ? [[expansionInfo.legalType, expansionInfo.legalTypeOther]]
          : []),
      ].some(([choice, other]) => choice === "기타" && !other?.trim())
      if (
        missingOther ||
        (expansionInfo.foundationType === "법인" && !expansionInfo.legalName?.trim())
      ) {
        toast.error(
          missingOther ? "선택한 기타 항목의 내용을 입력해주세요." : "법인명을 입력해주세요."
        )
        return
      }
    }

    // 회사 검증
    if (expansionInfo.orgType === "회사(의약품, 의료기기 화장품, MSO 등)") {
      const companyNameError = validateCompanyName(expansionInfo.companyName)

      if (companyNameError || !expansionInfo.companyCategory) {
        setShowErrors(true)

        if (companyNameError) {
          setTimeout(() => {
            const element = document.getElementById("company-name")
            if (element) {
              element.focus()
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
              const offsetPosition = elementPosition - 100
              window.scrollTo({ top: offsetPosition, behavior: "smooth" })
            }
          }, 100)
        } else if (!expansionInfo.companyCategory) {
          toast.error("회사 구분을 선택해주세요.")
          setTimeout(() => {
            const element = document.getElementById("company-category")
            if (element) {
              const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
              const offsetPosition = elementPosition - 100
              window.scrollTo({ top: offsetPosition, behavior: "smooth" })
            }
          }, 100)
        }
        return
      }

      // "기타" 선택 시 상세 입력 필수
      if (expansionInfo.companyCategory === "기타" && !expansionInfo.companyCategoryOther?.trim()) {
        setShowErrors(true)
        toast.error("기타 내용을 입력해주세요.")
        setTimeout(() => {
          const element = document.getElementById("company-category")
          if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
            const offsetPosition = elementPosition - 100
            window.scrollTo({ top: offsetPosition, behavior: "smooth" })
          }
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
      <div className="space-y-6">
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 2</div>
          <h2 className="text-2xl font-bold text-gray-900">의료 해외진출 기본 정보</h2>
          <p className="mt-2 text-sm text-gray-500">귀하의 기관 정보를 입력해주세요</p>
        </div>

        <QuestionSingleChoice
          id="org-type"
          label="귀하의 기관 구분은 무엇입니까?"
          required={true}
          options={getQuestionOptions("A", "A1")}
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
              options={getQuestionOptions("A", "A2_org_type")}
              value={expansionInfo.medicalOrgCategory}
              onChange={(value) => updateSection("expansionInfo", { medicalOrgCategory: value })}
              otherValue={expansionInfo.medicalOrgCategoryOther}
              onOtherChange={(value) =>
                updateSection("expansionInfo", { medicalOrgCategoryOther: value })
              }
            />

            <QuestionSingleChoice
              id="foundation-type"
              label="의료기관의 설립 유형을 선택해 주세요."
              required={true}
              options={getQuestionOptions("A", "A2_found_type")}
              value={expansionInfo.foundationType}
              onChange={handleFoundationTypeChange}
              otherValue={expansionInfo.foundationTypeOther}
              onOtherChange={(value) =>
                updateSection("expansionInfo", { foundationTypeOther: value })
              }
            />

            {expansionInfo.foundationType === "법인" && (
              <>
                <QuestionSingleChoice
                  id="legal-type"
                  label="법인 유형을 선택해 주세요."
                  required={true}
                  options={getQuestionOptions("A", "A2_legal_subtype")}
                  value={expansionInfo.legalType}
                  onChange={(value) => updateSection("expansionInfo", { legalType: value })}
                  otherValue={expansionInfo.legalTypeOther}
                  onOtherChange={(value) =>
                    updateSection("expansionInfo", { legalTypeOther: value })
                  }
                />
                <QuestionText
                  id="legal-name"
                  label="법인명을 입력해 주세요."
                  required={true}
                  value={expansionInfo.legalName ?? ""}
                  onChange={(value) => updateSection("expansionInfo", { legalName: value })}
                />
              </>
            )}
          </div>
        )}

        {expansionInfo.orgType === "회사(의약품, 의료기기 화장품, MSO 등)" && (
          <div className="space-y-6 rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-emerald-900">회사 정보</h3>
            </div>

            <QuestionText
              id="company-name"
              label="회사명을 입력해 주세요."
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
              label="회사 유형을 선택해 주세요."
              required={true}
              options={getQuestionOptions("A", "A3_company_type")}
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
