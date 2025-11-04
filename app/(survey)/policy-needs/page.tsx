"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { SurveyLayout } from "@/components/survey/SurveyLayout"
import { QuestionSingleChoice } from "@/components/survey/QuestionSingleChoice"
import { QuestionRankChoice } from "@/components/survey/QuestionRankChoice"
import { QuestionTextarea } from "@/components/survey/QuestionTextarea"
import { NavigationButton } from "@/components/survey/NavigationButton"
import { useSurveyForm } from "@/components/survey/SurveyProvider"
import { useSurveyStepGuard } from "@/components/survey/useSurveyStepGuard"

export default function PolicyNeedsPage() {
  const router = useRouter()
  const { data, updateSection } = useSurveyForm()
  const { policyNeeds } = data
  const canAccess = useSurveyStepGuard("policy-needs")

  if (!canAccess) {
    return null
  }

  const handleNext = () => {
    if (policyNeeds.difficultiesRank.length === 0) {
      toast.error("어려움 순위를 하나 이상 선택해주세요")
      setTimeout(() => {
        const element = document.getElementById("difficulties-rank")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    // "기타" 선택 시 입력값 필수 체크
    if (policyNeeds.difficultiesRank.includes("기타") && !policyNeeds.difficultiesOther?.trim()) {
      toast.error("어려움 순서의 '기타' 항목 내용을 입력해주세요")
      setTimeout(() => {
        const element = document.getElementById("difficulties-rank")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    if (policyNeeds.supportNeedsRank.length === 0) {
      toast.error("지원 필요 순위를 하나 이상 선택해주세요")
      setTimeout(() => {
        const element = document.getElementById("support-needs-rank")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    // "기타" 선택 시 입력값 필수 체크
    if (policyNeeds.supportNeedsRank.includes("기타") && !policyNeeds.supportNeedsOther?.trim()) {
      toast.error("지원 필요 순위의 '기타' 항목 내용을 입력해주세요")
      setTimeout(() => {
        const element = document.getElementById("support-needs-rank")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    if (!policyNeeds.desiredSupport) {
      toast.error("희망하는 지원 사업을 선택해주세요.")
      setTimeout(() => {
        const element = document.getElementById("desired-support")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    // "기타" 선택 시 입력값 필수 체크
    if (policyNeeds.desiredSupport === "기타" && !policyNeeds.desiredSupportOther?.trim()) {
      toast.error("희망하는 지원 사업의 '기타' 항목 내용을 입력해주세요")
      setTimeout(() => {
        const element = document.getElementById("desired-support")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    if (!policyNeeds.awareness) {
      toast.error("KOHES 인지도를 선택해주세요.")
      setTimeout(() => {
        const element = document.getElementById("awareness")
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - 100
          window.scrollTo({ top: offsetPosition, behavior: "smooth" })
        }
      }, 100)
      return
    }

    router.push("/complete")
  }

  const handleBack = () => {
    router.push("/project-details")
  }

  return (
    <SurveyLayout currentStep={4} totalSteps={5} onBack={handleBack} showBackButton={true}>
      <div className="space-y-10">
        <div>
          <div className="mb-2 text-sm font-medium text-blue-600">Section 4</div>
          <h2 className="text-2xl font-bold text-gray-900">의료 해외진출 정책 요구도</h2>
          <p className="mt-2 text-sm text-gray-500">정책 지원에 대한 의견을 들려주세요</p>
        </div>

        <QuestionRankChoice
          id="difficulties-rank"
          label="의료 해외진출 사업 추진 시, 가장 큰 걸림돌이 되는 요인을 순서대로 선택해 주세요."
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
          value={policyNeeds.difficultiesRank}
          onChange={(values) => updateSection("policyNeeds", { difficultiesRank: values })}
          otherValue={policyNeeds.difficultiesOther}
          onOtherChange={(value) => updateSection("policyNeeds", { difficultiesOther: value })}
        />

        <QuestionRankChoice
          id="support-needs-rank"
          label="의료 해외진출 활성화를 위해서 가장 필요한 정부 지원을 순서대로 선택해 주세요."
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
          value={policyNeeds.supportNeedsRank}
          onChange={(values) => updateSection("policyNeeds", { supportNeedsRank: values })}
          otherValue={policyNeeds.supportNeedsOther}
          onOtherChange={(value) => updateSection("policyNeeds", { supportNeedsOther: value })}
        />

        <QuestionSingleChoice
          id="desired-support"
          label="의료 해외진출 활성화를 위해 정부 지원 외에 가장 중요하다고 생각하는 과제는 무엇입니까?"
          required={true}
          options={[
            {
              value: "진출 기관 및 예정 기관 간의 네트워크 구축",
              label: "진출 기관 및 예정 기관 간의 네트워크 구축",
            },
            {
              value: "성공 및 실패 사례 공유",
              label: "성공 및 실패 사례 공유",
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
          value={policyNeeds.desiredSupport}
          onChange={(value) => updateSection("policyNeeds", { desiredSupport: value })}
          otherValue={policyNeeds.desiredSupportOther}
          onOtherChange={(value) => updateSection("policyNeeds", { desiredSupportOther: value })}
        />

        <QuestionSingleChoice
          id="awareness"
          label="KOHES(한국보건산업진흥원) 인지도를 선택해주세요."
          required={true}
          options={[
            { value: "방문한 적 있다.", label: "방문한 적 있다." },
            {
              value: "방문한 적은 없지만, 들어본 적 있다.",
              label: "방문한 적은 없지만, 들어본 적 있다.",
            },
            { value: "들어본 적 없다.", label: "들어본 적 없다." },
          ]}
          value={policyNeeds.awareness}
          onChange={(value) => updateSection("policyNeeds", { awareness: value })}
        />

        <QuestionTextarea
          id="additional-comments"
          label="추가로 의견을 남겨주세요."
          placeholder="자유롭게 의견을 작성해주세요."
          value={policyNeeds.additionalComments}
          onChange={(value) => updateSection("policyNeeds", { additionalComments: value })}
        />

        <div className="mt-8">
          <NavigationButton onClick={handleNext}>제출</NavigationButton>
        </div>
      </div>
    </SurveyLayout>
  )
}
