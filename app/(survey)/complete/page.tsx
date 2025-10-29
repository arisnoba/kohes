'use client'

import { CheckCircle, Gift, Mail } from 'lucide-react'

export default function CompletePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            설문이 완료되었습니다
          </h1>
          <p className="text-lg text-gray-600">
            소중한 의견을 주셔서 감사합니다
          </p>
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
              필수 항목을 모두 완료하신 경우, 스타벅스 2만원 상품권이
              입력하신 이메일로 발송됩니다.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              ※ 예산 소진 시 조기 마감될 수 있습니다
            </p>
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
        <div className="mt-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center text-white shadow-lg">
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
