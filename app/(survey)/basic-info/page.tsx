"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Info } from "lucide-react"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionText } from "@/components/survey/QuestionText"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { useSurveyForm } from "@/components/survey/SurveyProvider"
import {
  MAX_PHONE_LENGTH,
  formatLandlineNumber,
  formatMobileNumber,
  mobileRegex,
  telRegex,
} from "@/lib/validation/phone"

// RFC 5322 compliant email validation (practical subset)
// Prevents consecutive dots, leading/trailing dots in local and domain parts
const emailRegex = /^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/

export default function BasicInfoPage() {
  const router = useRouter()
  const { data, updateSection } = useSurveyForm()
  const { basicInfo } = data
  const [isMounted, setIsMounted] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const handleChange = (field: keyof typeof basicInfo, value: string) => {
    updateSection("basicInfo", { [field]: value })
  }

  const handleTelChange = (value: string) => {
    handleChange("tel", formatLandlineNumber(value))
  }

  const handleMobileChange = (value: string) => {
    handleChange("mobile", formatMobileNumber(value))
  }

  // Validation functions
  const validateName = (value: string) => {
    if (!value.trim()) return "성명을 입력해주세요."
    return null
  }

  const validatePosition = (value: string) => {
    if (!value.trim()) return "직위를 입력해주세요."
    return null
  }

  const validateTel = (value: string) => {
    if (!value.trim()) return "전화번호를 입력해주세요."
    if (!telRegex.test(value)) return "올바른 전화번호 형식을 입력해주세요. 예: 02-1234-5678"
    return null
  }

  const validateMobile = (value: string) => {
    if (!value.trim()) return "휴대전화번호를 입력해주세요."
    if (!mobileRegex.test(value)) return "올바른 휴대전화번호 형식을 입력해주세요. 예: 010-1234-5678"
    return null
  }

  const validateEmail = (value: string) => {
    if (!value.trim()) return "이메일을 입력해주세요."
    if (!emailRegex.test(value)) return "올바른 이메일 형식을 입력해주세요."
    return null
  }

  const validateAddress = (value: string) => {
    if (!value.trim()) return "주소를 입력해주세요."
    return null
  }

  const handleNext = () => {
    // 모든 필드 검증 (모든 검증을 먼저 실행)
    const nameError = validateName(basicInfo.name)
    const positionError = validatePosition(basicInfo.position)
    const telError = validateTel(basicInfo.tel)
    const mobileError = validateMobile(basicInfo.mobile)
    const emailError = validateEmail(basicInfo.email)
    const addressError = validateAddress(basicInfo.address)

    // 에러가 하나라도 있으면
    const hasErrors = nameError || positionError || telError || mobileError || emailError || addressError

    if (hasErrors) {
      // 모든 에러 표시
      setShowErrors(true)

      // 첫 번째 에러 필드 찾기
      const firstErrorId = nameError
        ? "name"
        : positionError
          ? "position"
          : telError
            ? "tel"
            : mobileError
              ? "mobile"
              : emailError
                ? "email"
                : "address"

      // 에러가 있는 필드로 포커스 이동
      setTimeout(() => {
        const element = document.getElementById(firstErrorId)
        if (element) {
          element.focus()
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
      return
    }

    router.push("/expansion-info")
  }

  const handleBack = () => {
    router.push("/intro")
  }

  // 클라이언트 마운트 확인
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <SurveyLayout currentStep={1} totalSteps={5} onBack={handleBack} showBackButton={true}>
      <div className="space-y-8">
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 1</div>
          <h2 className="text-2xl font-bold text-gray-900">응답자 기초정보</h2>
          <p className="mt-2 text-sm text-gray-500">귀하의 기본 정보를 입력해주세요</p>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-4">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
          <p className="text-sm text-blue-900">
            입력하신 정보는 경품 지급 및 현황 조사를 위해서만 사용되며, 통계법에 따라 비밀이
            보장됩니다.
          </p>
        </div>

        <div className="space-y-6">
          <QuestionText
            id="name"
            label="성명"
            placeholder="홍길동"
            required={true}
            value={basicInfo.name}
            onChange={(value) => handleChange("name", value)}
            validate={validateName}
            error={showErrors ? validateName(basicInfo.name) || undefined : undefined}
          />

          <QuestionText
            id="position"
            label="직위"
            placeholder="예: 과장, 팀장, 원장 등"
            required={true}
            value={basicInfo.position}
            onChange={(value) => handleChange("position", value)}
            validate={validatePosition}
            error={showErrors ? validatePosition(basicInfo.position) || undefined : undefined}
          />

          <QuestionText
            id="tel"
            label="전화번호"
            type="tel"
            placeholder="02-1234-5678"
            required={true}
            value={basicInfo.tel}
            onChange={handleTelChange}
            validate={validateTel}
            error={showErrors ? validateTel(basicInfo.tel) || undefined : undefined}
            maxLength={MAX_PHONE_LENGTH}
            inputMode="tel"
          />

          <QuestionText
            id="mobile"
            label="휴대전화"
            type="tel"
            placeholder="010-1234-5678"
            required={true}
            value={basicInfo.mobile}
            onChange={handleMobileChange}
            validate={validateMobile}
            error={showErrors ? validateMobile(basicInfo.mobile) || undefined : undefined}
            maxLength={MAX_PHONE_LENGTH}
            inputMode="tel"
          />

          <QuestionText
            id="email"
            label="이메일"
            type="email"
            placeholder="example@email.com"
            required={true}
            value={basicInfo.email}
            onChange={(value) => handleChange("email", value)}
            validate={validateEmail}
            error={showErrors ? validateEmail(basicInfo.email) || undefined : undefined}
          />

          <QuestionText
            id="address"
            label="주소"
            placeholder="예: 서울특별시 강남구 테헤란로 123"
            required={true}
            value={basicInfo.address}
            onChange={(value) => handleChange("address", value)}
            validate={validateAddress}
            error={showErrors ? validateAddress(basicInfo.address) || undefined : undefined}
          />
        </div>

        <div className="mt-8">
          <NavigationButton onClick={handleNext}>
            다음
          </NavigationButton>
        </div>
      </div>
    </SurveyLayout>
  )
}
