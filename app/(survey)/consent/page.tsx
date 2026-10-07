"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Info, ChevronDown } from "lucide-react"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { useSurveyForm } from "@/components/survey/SurveyProvider"
import { useSurveyStepGuard } from "@/components/survey/useSurveyStepGuard"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function ConsentPage() {
  const router = useRouter()
  const { data, updateSection } = useSurveyForm()
  const canAccess = useSurveyStepGuard("consent")
  const [isConsentOpen, setIsConsentOpen] = useState(true)
  const consent =
    data.basicInfo.privacyConsent === "동의합니다"
      ? true
      : data.basicInfo.privacyConsent === "동의하지 않습니다"
        ? false
        : null
  const setConsent = (value: boolean) =>
    updateSection("basicInfo", { privacyConsent: value ? "동의합니다" : "동의하지 않습니다" })
  if (!canAccess) return null
  return (
    <SurveyLayout currentStep={0} totalSteps={5} onBack={() => router.push("/eligibility")}>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-900">개인정보 수집 및 이용 동의</h2>
        {/* 개인정보 수집·이용 통합 동의 */}
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
                    aria-label="개인정보 수집·이용 동의서 펼치기/접기"
                  >
                    <span className="text-base font-semibold text-gray-700">
                      개인정보 수집 및 이용 동의서
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
                    <p>• 수집 및 이용하는 자 : 한국보건산업진흥원, 주식회사 오</p>
                    <p>• 수집 및 이용 목적 : 조사 답례품 발송 및 응답 내용 검증</p>
                    <p>
                      • 수집 및 이용하고자 하는 개인정보 항목 : 성명, 소속, 직책, 연락처, E-mail,
                      주소, 설문 응답 내용
                    </p>
                    <p>
                      • 개인정보 보유 및 이용 기간 :{" "}
                      <span className="font-bold">응답 완료로부터 1년</span>
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-gray-600">
                  개인정보 수집에 대하여 동의를 거부하실 수 있으며, 동의를 거부하실 경우 설문에
                  참여하실 수 없습니다. 개인정보 수집 및 이용에 동의하시겠습니까?
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

        {consent === false && (
          <p role="status" className="rounded-lg bg-gray-50 p-6 text-sm text-gray-700">
            개인정보 수집 및 이용에 동의하지 않으면 설문에 참여하실 수 없습니다.
          </p>
        )}
        <NavigationButton disabled={consent !== true} onClick={() => router.push("/basic-info")}>
          동의하고 계속하기
        </NavigationButton>
      </div>
    </SurveyLayout>
  )
}
