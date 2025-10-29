"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionSingleChoice } from "@/components/survey/QuestionSingleChoice"
import { QuestionRankChoice } from "@/components/survey/QuestionRankChoice"
import { QuestionTextarea } from "@/components/survey/QuestionTextarea"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { DevTools } from "@/components/survey/DevTools"

export default function PolicyNeedsPage() {
  const router = useRouter()
  const [skipValidation, setSkipValidation] = useState(false)

  // C1: 어려움 순위 (9개)
  const [difficultiesRank, setDifficultiesRank] = useState<string[]>([])

  // C2: 지원 필요 순위 (8개)
  const [supportNeedsRank, setSupportNeedsRank] = useState<string[]>([])

  // C3: 희망 지원 사업
  const [desiredSupport, setDesiredSupport] = useState("")

  // C4: KOHES 인지도
  const [awareness, setAwareness] = useState("")

  // C5: 추가 의견
  const [additionalComments, setAdditionalComments] = useState("")

  // 개발자 도구: 자동 채우기
  const handleAutoFill = () => {
    setDifficultiesRank(["자금 조달의 어려움", "수익 예측의 불확실성", "해외 정보 부족"])
    setSupportNeedsRank(["현지 정보 제공", "정책 자금 지원"])
    setDesiredSupport("네트워크 구축")
    setAwareness("방문")
    setAdditionalComments("해외진출 지원 확대를 희망합니다.")
  }

  const validateForm = () => {
    if (skipValidation) return true

    if (difficultiesRank.length === 0) {
      alert("어려움 순위를 하나 이상 선택해주세요.")
      return false
    }

    if (supportNeedsRank.length === 0) {
      alert("지원 필요 순위를 하나 이상 선택해주세요.")
      return false
    }

    if (!desiredSupport) {
      alert("희망하는 지원 사업을 선택해주세요.")
      return false
    }

    if (!awareness) {
      alert("KOHES 인지도를 선택해주세요.")
      return false
    }

    return true
  }

  const handleNext = () => {
    if (validateForm()) {
      router.push("/complete")
    }
  }

  const handleBack = () => {
    router.push("/project-details")
  }

  const isFormValid =
    skipValidation ||
    (difficultiesRank.length > 0 && supportNeedsRank.length > 0 && desiredSupport && awareness)

  return (
    <SurveyLayout currentStep={4} totalSteps={5} onBack={handleBack} showBackButton={true}>
      <div className="space-y-10">
        {/* Section Title */}
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 4</div>
          <h2 className="text-xl font-bold text-gray-900">의료 해외진출 정책 요구도</h2>
          <p className="mt-2 text-sm text-gray-500">정책 지원에 대한 의견을 들려주세요</p>
        </div>

        {/* C1: 어려움 순위 */}
        <QuestionRankChoice
          id="difficulties-rank"
          label="의료 해외진출 사업 추진 시, 가장 큰 어려움을 순서대로 선택해주세요"
          required={true}
          maxRanks={9}
          options={[
            { value: "자금 조달의 어려움", label: "자금 조달의 어려움" },
            { value: "수익 예측의 불확실성", label: "수익 예측의 불확실성" },
            { value: "해외 정보 부족", label: "현지(해외) 정보 부족" },
            {
              value: "파트너 신뢰 문제",
              label: "현지(해외) 파트너 신뢰의 어려움 혹은 의견 불일치",
            },
            {
              value: "정치·법·제도",
              label: "정권에 따라 변화하는 등 불안정한 현지(해외) 정치·법·제도",
            },
            { value: "전문 인력 부족", label: "의료 해외진출 관련 전문인력 부족" },
            { value: "현지 고용 어려움", label: "현지(해외) 전문인력 고용의 어려움" },
            {
              value: "인허가, 면허 등 현지(해외) 법·제도 규제",
              label: "인허가, 면허 등 현지(해외) 법·제도 규제",
            },
            { value: "네트워크 부재", label: "현지 네트워크 부재" },
            { value: "기타", label: "기타" },
          ]}
          value={difficultiesRank}
          onChange={setDifficultiesRank}
        />

        {/* C2: 지원 필요 순위 */}
        <QuestionRankChoice
          id="support-needs-rank"
          label="의료 해외진출 활성화를 위해서 가장 필요한 정부 지원을 순서대로 선택해주세요"
          required={true}
          maxRanks={8}
          options={[
            {
              value: "현지 문화, 법, 정책, 동향 등 유관 정보 지원",
              label: "현지 문화, 법, 정책, 동향 등 유관 정보 지원",
            },
            {
              value: "의료 해외진출 사업을 위한 대출 등 정책자금 지원",
              label: "의료 해외진출 사업을 위한 대출 등 정책자금 지원",
            },
            {
              value: "현지 파트너 발굴 및 검증 지원",
              label: "현지 파트너 발굴 및 검증 지원",
            },
            {
              value: "의료 해외진출 관련 전문인력 역량강화를 위한 교육",
              label: "의료 해외진출 관련 전문인력 역량강화를 위한 교육",
            },
            { value: "컨설팅 지원", label: "의료 해외진출 사업 수행을 위한 컨설팅 지원" },
            {
              value: "의료 해외진출을 위한 파트너링 행사 개최(수출상담회, 비즈니스 미팅 등)",
              label: "의료 해외진출을 위한 파트너링 행사 개최(수출상담회, 비즈니스 미팅 등)",
            },
            {
              value: "기 진출 의료기관 선도사례 및 진출 전략 공유",
              label: "기 진출 의료기관 선도사례 및 진출 전략 공유",
            },
            {
              value: "한국의료 브랜드(Medical Korea) 및 우수기술 홍보",
              label: "한국의료 브랜드(Medical Korea) 및 우수기술 홍보",
            },
            { value: "기타", label: "기타" },
          ]}
          value={supportNeedsRank}
          onChange={setSupportNeedsRank}
        />

        {/* C3: 희망 지원 사업 */}
        <QuestionSingleChoice
          id="desired-support"
          label="의료 해외진출 활성화를 위해 정부 지원 외에 가장 중요하다고 생각하는 과제는 무엇입니까?"
          required={true}
          options={[
            {
              value: "진출 기관 및 예정기관 간의 네트워크 구축",
              label: "진출 기관 및 예정기관 간의 네트워크 구축",
            },
            {
              value: "성공/실패 사례 공유",
              label: "성공/실패 사례 공유",
            },
            {
              value: "선진국 진출사례 공유",
              label: "선진국 진출사례 공유",
            },
            {
              value: "의료 해외진출 및 신고제도 홍보",
              label: "의료 해외진출 및 신고제도 홍보",
            },
            {
              value: "인력 매칭을 위한 플랫폼 운영",
              label: "인력 매칭을 위한 플랫폼 운영",
            },
            {
              value: "기타",
              label: "기타",
            },
          ]}
          value={desiredSupport}
          onChange={setDesiredSupport}
        />

        {/* C4: KOHES 인지도 */}
        <QuestionSingleChoice
          id="kohes-awareness"
          label="정부는 의료 해외진출에 대한 정보 등을 공유하기 위해 의료해외진출 종합정보포털(KOHES)을 운영하고 있습니다. 해당 KOHES 포털을 방문하시거나 들어보신 적이 있으십니까?"
          required={true}
          options={[
            { value: "방문", label: "방문한 적이 있다" },
            { value: "들어봄", label: "들어본 적이 있다" },
            { value: "모름", label: "잘 모른다" },
          ]}
          value={awareness}
          onChange={setAwareness}
        />

        {/* C5: 추가 의견 */}
        <QuestionTextarea
          id="additional-comments"
          label="의료 해외진출을 활성화하기 위해 정부에 원하는 지원사항이 있으면 자유롭게 의견을 작성해주세요."
          placeholder="예: 특정 국가에 대한 정보가 부족합니다, 법률 자문 서비스가 필요합니다 등"
          required={false}
          rows={6}
          value={additionalComments}
          onChange={setAdditionalComments}
        />

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
