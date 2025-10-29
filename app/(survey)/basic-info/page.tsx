"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionText } from "@/components/survey/QuestionText"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { DevTools } from "@/components/survey/DevTools"

export default function BasicInfoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    tel: "",
    mobile: "",
    email: "",
    address: "",
  })
  const [skipValidation, setSkipValidation] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 개발자 도구: 자동 채우기
  const handleAutoFill = () => {
    setFormData({
      name: "홍길동",
      position: "팀장",
      tel: "02-1234-5678",
      mobile: "010-1234-5678",
      email: "test@example.com",
      address: "서울특별시 강남구 테헤란로 123",
    })
  }

  const validateForm = () => {
    // 개발 모드에서 검증 스킵 활성화 시
    if (skipValidation) {
      return true
    }

    const { name, position, tel, mobile, email } = formData

    if (!name.trim()) {
      alert("성명을 입력해주세요.")
      return false
    }
    if (!position.trim()) {
      alert("직위를 입력해주세요.")
      return false
    }
    if (!tel.trim()) {
      alert("전화번호를 입력해주세요.")
      return false
    }
    if (!mobile.trim()) {
      alert("휴대전화번호를 입력해주세요.")
      return false
    }
    if (!email.trim()) {
      alert("이메일을 입력해주세요.")
      return false
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식을 입력해주세요.")
      return false
    }

    return true
  }

  const handleNext = () => {
    if (validateForm()) {
      router.push("/expansion-info")
    }
  }

  const handleBack = () => {
    router.push("/intro")
  }

  const isFormValid =
    skipValidation ||
    (formData.name.trim() &&
      formData.position.trim() &&
      formData.tel.trim() &&
      formData.mobile.trim() &&
      formData.email.trim())

  return (
    <SurveyLayout currentStep={1} totalSteps={5} onBack={handleBack} showBackButton={true}>
      <div className="space-y-8">
        {/* Section Title */}
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 1</div>
          <h2 className="text-xl font-bold text-gray-900">응답자 기초정보</h2>
          <p className="mt-2 text-sm text-gray-500">귀하의 기본 정보를 입력해주세요</p>
        </div>
        {/* Privacy Notice */}
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            📌 입력하신 정보는 경품 지급 및 현황 조사를 위해서만 사용되며, 통계법에 따라 비밀이
            보장됩니다.
          </p>
        </div>

        {/* Basic Information Form */}
        <div className="space-y-6">
          <QuestionText
            id="name"
            label="성명"
            placeholder="홍길동"
            required={true}
            value={formData.name}
            onChange={(value) => handleChange("name", value)}
          />

          <QuestionText
            id="position"
            label="직위"
            placeholder="예: 과장, 팀장, 원장 등"
            required={true}
            value={formData.position}
            onChange={(value) => handleChange("position", value)}
          />

          {/* Contact Information Section */}
          <QuestionText
            id="tel"
            label="전화번호"
            type="tel"
            placeholder="02-1234-5678"
            required={false}
            value={formData.tel}
            onChange={(value) => handleChange("tel", value)}
          />

          <QuestionText
            id="mobile"
            label="휴대전화"
            type="tel"
            placeholder="010-1234-5678"
            required={true}
            value={formData.mobile}
            onChange={(value) => handleChange("mobile", value)}
          />

          <QuestionText
            id="email"
            label="이메일"
            type="email"
            placeholder="example@email.com"
            required={true}
            value={formData.email}
            onChange={(value) => handleChange("email", value)}
          />

          <QuestionText
            id="address"
            label="주소"
            placeholder="예: 서울특별시 강남구 테헤란로 123"
            required={false}
            value={formData.address}
            onChange={(value) => handleChange("address", value)}
          />
        </div>

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
