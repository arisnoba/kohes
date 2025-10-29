"use client"

import { useRouter } from "next/navigation"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { Shield, Gift, Clock } from "lucide-react"

export default function IntroPage() {
  const router = useRouter()

  const handleStart = () => {
    router.push("/basic-info")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            2025년 의료해외진출
            <br />
            현황조사
          </h1>
          <p className="text-lg text-gray-600">귀하의 소중한 의견을 듣고자 합니다</p>
        </div>

        {/* Info Cards */}
        <div className="mb-12 space-y-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-base text-gray-600 leading-relaxed">
              안녕하십니까? <br />
              한국보건산업진흥원에서는 의료해외진출 기 진출 기관 및 예정 기관을 대상으로 의료
              해외진출 현황을 파악하기 위한 설문조사를 진행하고 있습니다.
              <br /> 본 조사는 의료 해외진출 지원 정책 마련 및 진출 활성화를 위한 의견 수렴을
              목적으로 진행됩니다.
              <br />
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">
                응답해주신 내용은 통계적 분석으로만 사용될 뿐이며, 통계법 제33조, 제34조에 의해
                철저히 비밀이 보장되오니, 잠시만 협조해 주시면 감사하겠습니다.
              </h3>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">참여 보상</h3>
            </div>
            <p className="text-sm text-gray-600">
              필수 항목을 모두 완료하신 분께 스타벅스 2만원 상품권을 드립니다.
              <br />
              <b>기초정보는 경품 지급 및 현황 조사를 위해서만 사용됩니다.</b>
              <br />
              <span className="text-xs text-gray-500">※ 예산 소진 시까지</span>
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900">소요 시간</h3>
            </div>
            <p className="text-sm text-gray-600">약 10-15분 정도 소요됩니다.</p>
          </div>
        </div>

        {/* Survey Overview */}
        <div className="mb-8 rounded-xl bg-gray-50 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">조사 구성</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600">1.</span>
              <span>응답자 기초정보</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600">2.</span>
              <span>의료 해외진출 기본 정보</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600">3.</span>
              <span>의료 해외진출 사업 세부정보</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600">4.</span>
              <span>의료 해외진출 정책 요구도</span>
            </li>
          </ol>
        </div>

        {/* Start Button */}
        <div className="sticky bottom-6">
          <NavigationButton onClick={handleStart}>설문 시작하기</NavigationButton>
        </div>
      </div>
    </div>
  )
}
