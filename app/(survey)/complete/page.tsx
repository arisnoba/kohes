"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Gift, Mail, Loader2, AlertCircle } from "lucide-react"
import { useSurveyForm } from "@/components/survey/SurveyProvider"
import { useSurveyStepGuard } from "@/components/survey/useSurveyStepGuard"

export default function CompletePage() {
  const router = useRouter()
  const { submitSurvey } = useSurveyForm()
  const canAccess = useSurveyStepGuard("complete")
  const [status, setStatus] = useState<"submitting" | "success" | "error">("submitting")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!canAccess) {
      return
    }

    const submit = async () => {
      try {
        const result = await submitSurvey()

        if (result.success) {
          setStatus("success")
        } else {
          setStatus("error")
          setErrorMessage(result.error || "알 수 없는 오류가 발생했습니다")
        }
      } catch (error) {
        console.error("제출 오류:", error)
        setStatus("error")
        setErrorMessage("네트워크 오류가 발생했습니다")
      }
    }

    submit()
  }, [canAccess, submitSurvey])

  if (!canAccess) {
    return null
  }

  // 제출 중 로딩 화면
  if (status === "submitting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-blue-100 p-6">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">설문을 제출하고 있습니다...</h1>
            <p className="text-lg text-gray-600">잠시만 기다려주세요</p>
          </div>
        </div>
      </div>
    )
  }

  // 제출 실패 화면
  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-red-100 p-6">
              <AlertCircle className="h-16 w-16 text-red-600" />
            </div>
          </div>
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">제출 중 오류가 발생했습니다</h1>
            <p className="mb-6 text-lg text-gray-600">{errorMessage}</p>
            <button
              onClick={() => router.back()}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 제출 성공 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-8 text-center">
          <h1 className="mb-1 md:mb-2 text-3xl md:text-4xl font-bold text-gray-900">
            설문이 완료되었습니다
          </h1>
          <p className="text-lg text-gray-600">소중한 의견을 주셔서 감사합니다</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">보상 안내</h3>
            </div>
            <p className="text-sm text-gray-600">
              필수 항목을 모두 완료하신 경우, 스타벅스 2만원 상품권이 입력하신 이메일로 발송됩니다.
            </p>
            <p className="mt-2 text-xs text-gray-500">※ 예산 소진 시 조기 마감될 수 있습니다</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">문의하기</h3>
            </div>
            <p className="text-sm text-gray-600">
              설문 관련 문의사항이 있으시면 아래로 연락해주세요.
            </p>
            <a
              href="mailto:kohes@example.com"
              className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              kohes@example.com
            </a>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-8 md:mt-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 md:p-8 text-center text-white shadow-lg">
          <p className="text-lg font-semibold">
            대한민국 의료 해외진출의
            <br />
            발전을 위해 함께해 주셔서 감사합니다
          </p>
        </div>

        {/* Home Button */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}
