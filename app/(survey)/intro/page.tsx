"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { Shield, Gift, Clock, ChevronDown } from "lucide-react"
import Image from "next/image"
export default function IntroPage() {
  const router = useRouter()
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)

  const handleStart = () => {
    router.push("/basic-info")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-12 text-center flex flex-col items-center">
          <a href="https://www.khidi.or.kr/" target="_blank">
            <Image
              src="https://www.khidi.or.kr/resources/images/kps/new_layout/logo.png"
              alt="logo"
              width={108}
              height={54}
              className="mb-4 md:mb-8 h-8 md:h-10 w-auto"
            />
          </a>
          <h1 className="mb-1 md:mb-2 text-2xl md:text-4xl font-bold text-gray-900">
            2025년 의료해외진출 현황조사
          </h1>
          <p className="text-base md:text-lg font-medium text-gray-600">
            귀하의 소중한 의견을 듣고자 합니다.
          </p>
        </div>

        {/* Info Cards */}
        <div className="mb-6 space-y-3">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <p className="text-base text-gray-600 leading-relaxed">
              안녕하십니까? <br />
              한국보건산업진흥원에서는 의료해외진출 기 진출 기관 및 예정 기관을 대상으로 의료
              해외진출 현황을 파악하기 위한 설문조사를 진행하고 있습니다.
            </p>
            <p className="text-base text-gray-600 leading-relaxed">
              본 조사는 의료 해외진출 지원 정책 마련 및 진출 활성화를 위한 의견 수렴을 목적으로
              진행됩니다.
            </p>
            <p className="font-semibold text-gray-900 leading-relaxed mb-4">
              응답해주신 내용은 통계적 분석으로만 사용될 뿐이며, 통계법 제33조, 제34조에 의해 철저히
              비밀이 보장되오니, 잠시만 협조해 주시면 감사하겠습니다.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                className="flex items-center justify-between w-full text-left text-sm font-semibold text-blue-600 hover:text-blue-400 transition-colors"
              >
                <span>통계법 확인하기</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isAccordionOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {isAccordionOpen && (
                <div className="mt-3 pl-4 border-l-2 border-blue-200 space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">제33조 (비밀의 보호)</h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p>
                        ① 통계의 작성과정에서 알려진 사항으로서 개인이나 법인 또는 단체 등의 비밀에
                        속하는 사항은 보호되어야 한다.
                      </p>
                      <p>
                        ② 통계의 작성을 위하여 수립된 개인이나 법인 또는 단체 등의 비밀에 속하는
                        자료는 통계작성 외의 목적으로 사용되어서는 아니 된다.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <div className="pt-1.5 space-y-2">
                <h3 className="font-semibold text-gray-900">
                  필수 항목을 모두 완료하신 분께{" "}
                  <span className="text-green-600">스타벅스 2만원 상품권</span> 지급 예정입니다.
                </h3>
                <p className="text-sm text-gray-600">
                  개인정보는 경품 지급 및 현황 조사를 위해서만 사용되며, 외부로 유출되지 않습니다.
                  <br />
                  <span className="text-xs text-gray-500">※ 예산 소진 시까지</span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-0">약 10-15분 정도 소요됩니다.</h3>
            </div>
          </div>
        </div>

        {/* Survey Overview */}
        <div className="mb-8 rounded-xl bg-blue-50 p-6 border border-blue-100">
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
        <div className="mt-8">
          <NavigationButton onClick={handleStart}>설문 시작하기</NavigationButton>
        </div>
      </div>
    </div>
  )
}
