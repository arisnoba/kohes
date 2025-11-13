"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Info, ChevronDown } from "lucide-react"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionText } from "@/components/survey/QuestionText"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { useSurveyForm } from "@/components/survey/SurveyProvider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  MAX_PHONE_LENGTH,
  formatLandlineNumber,
  formatMobileNumber,
  mobileRegex,
  telRegex,
} from "@/lib/validation/phone"

// RFC 5322 compliant email validation (practical subset)
// Prevents consecutive dots, leading/trailing dots in local and domain parts
const emailRegex =
  /^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/

export default function BasicInfoPage() {
  const router = useRouter()
  const { data, updateSection, skipValidation } = useSurveyForm()
  const { basicInfo } = data
  const [showErrors, setShowErrors] = useState(false)

  // 개인정보 수집·이용 및 제3자 제공 통합 동의 상태
  const [consent, setConsent] = useState<boolean | null>(null)
  const [isConsentOpen, setIsConsentOpen] = useState(true)

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
    if (!mobileRegex.test(value))
      return "올바른 휴대전화번호 형식을 입력해주세요. 예: 010-1234-5678"
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
    if (skipValidation) {
      router.push("/expansion-info")
      return
    }

    // 개인정보 동의 검증
    if (consent === null) {
      toast.error("개인정보 수집·이용 및 제3자 제공 동의를 선택해주세요.")
      return
    }

    // 비동의 시 개인정보 공란으로 설정
    if (consent === false) {
      updateSection("basicInfo", {
        name: "개인정보 비동의",
        position: "",
        tel: "",
        mobile: "",
        email: "",
        address: "",
      })
      router.push("/expansion-info")
      return
    }

    // 동의 시에만 개인정보 검증
    const nameError = validateName(basicInfo.name)
    const positionError = validatePosition(basicInfo.position)
    const telError = validateTel(basicInfo.tel)
    const mobileError = validateMobile(basicInfo.mobile)
    const emailError = validateEmail(basicInfo.email)
    const addressError = validateAddress(basicInfo.address)

    // 에러가 하나라도 있으면
    const hasErrors =
      nameError || positionError || telError || mobileError || emailError || addressError

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
          // 요소의 위치를 계산하여 헤더 높이만큼 오프셋을 적용
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100 // 헤더(80px) + 여유공간(20px)

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          })
        }
      }, 100)
      return
    }

    router.push("/expansion-info")
  }

  const handleBack = () => {
    router.push("/intro")
  }

  return (
    <SurveyLayout currentStep={1} totalSteps={5} onBack={handleBack} showBackButton={true}>
      <div className="space-y-8">
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 1</div>
          <h2 className="text-2xl font-bold text-gray-900">응답자 기초정보</h2>
          <p className="mt-2 text-sm text-gray-500">귀하의 기본 정보를 입력해주세요</p>
        </div>

        {/* 개인정보 수집·이용 및 제3자 제공 통합 동의 */}
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-gray-700">
            본 조사는 조사 참여자에 대한 답례품 발송, 응답 내용 검증을 위해 아래와 같이 개인정보를
            수집하고자 합니다. 제공하신 개인정보는 목적 외에 사용하지 않으며, 이용 기간 이후 즉시
            파기할 예정입니다.
          </p>
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <p className="text-sm text-blue-900">
              입력하신 정보는 경품 지급 및 현황 조사를 위해서만 사용되며, 통계법에 따라 비밀이
              보장됩니다.
            </p>
          </div>

          {/* 통합 동의서 */}
          <div className="space-y-3">
            <Collapsible
              open={isConsentOpen}
              onOpenChange={setIsConsentOpen}
              className="rounded-lg border border-gray-200 bg-white"
            >
              <div className="flex items-start justify-between gap-2">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex flex-1 items-start justify-between gap-2 p-4 text-left"
                    aria-label="개인정보 수집·이용 및 제3자 제공 동의서 펼치기/접기"
                  >
                    <span className="text-base font-semibold text-gray-700">
                      개인정보 수집·이용 및 제3자 제공 동의
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        isConsentOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-3 px-4 pb-4 text-sm text-gray-700">
                <div className="space-y-2">
                  <p className="font-semibold">개인정보 수집 및 이용 동의서</p>
                  <div className="space-y-1">
                    <p>• 수집 및 이용하는 자 : 한국보건산업진흥원, 주식회사 해리</p>
                    <p>• 수집 및 이용 목적 : 조사 답례품 발송 및 응답 내용 검증</p>
                    <p>
                      • 수집 및 이용하고자 하는 개인정보 항목 : 성명, 소속, 직책, 연락처, E-mail,
                      주소, 설문 응답내용
                    </p>
                    <p>• 개인정보 보유 및 이용 기간 : 응답 완료로부터 6개월</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold">개인정보 제3자 제공 동의서</p>
                  <div className="space-y-1">
                    <p>• 제공받는 자 : 한국보건산업진흥원, 주식회사 해리</p>
                    <p>• 제공받는 자의 이용 목적 : 응답 내용 검증</p>
                    <p>
                      • 제공하는 개인정보 항목 : 성명, 소속, 직책, 연락처, E-mail, 주소, 설문
                      응답내용
                    </p>
                    <p>• 개인정보 보유 및 이용 기간 : 제공 받은 후 6개월</p>
                  </div>
                </div>

                <p className="mt-3 text-gray-600">
                  개인정보 수집·이용 및 제3자 제공에 대하여 동의를 거부하실 수 있으며, 동의를
                  거부하실 경우 답례품 제공에 제약이 있습니다. 개인정보 수집·이용 및 제3자 제공에
                  동의하시겠습니까?
                </p>
              </CollapsibleContent>
            </Collapsible>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setConsent(true)
                  setIsConsentOpen(false)
                }}
                className={`relative flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-base font-medium transition-all ${
                  consent === true
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {consent === true && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                    </svg>
                  </div>
                )}
                동의합니다
              </button>

              <button
                type="button"
                onClick={() => {
                  setConsent(false)
                  setIsConsentOpen(false)
                }}
                className={`relative flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-base font-medium transition-all ${
                  consent === false
                    ? "border-gray-600 bg-gray-50 text-gray-900"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {consent === false && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-600">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L5 6.586 3.707 5.293z" />
                    </svg>
                  </div>
                )}
                동의하지 않습니다
              </button>
            </div>
          </div>
        </div>

        {/* 동의 시에만 입력창 표시 */}
        {consent === true && (
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
        )}

        {/* 개인정보 비동의 시 안내 메시지 */}
        {consent === false && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-600">
              개인정보 수집·이용 및 제3자 제공에 동의하지 않으셨습니다.
              <br />
              개인정보 입력 없이 설문에 참여하실 수 있습니다.
            </p>
          </div>
        )}

        <div className="mt-8">
          <NavigationButton onClick={handleNext}>다음</NavigationButton>
        </div>
      </div>
    </SurveyLayout>
  )
}
