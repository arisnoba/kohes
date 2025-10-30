import { describe, expect, it } from "vitest"

import { aggregateSurveyResponses } from "../../src/lib/admin/question-aggregator"
import { getSurveyQuestionSummaries } from "../../src/lib/survey/schema-loader"
import type { SurveyResponseRecord } from "../../src/lib/supabase/responses"

const questions = getSurveyQuestionSummaries()

const entries: SurveyResponseRecord[] = [
  {
    id: "r1",
    submittedAt: "2024-01-01T00:00:00Z",
    responseData: {
      basicInfo: { position: "팀장" },
      expansionInfo: {
        orgType: "의료기관",
        medicalOrgName: "서울대학교병원",
        medicalOrgCategory: "상급종합병원",
        foundationType: "법인",
        legalType: "의료법인",
        companyName: "",
        companyCategory: "",
      },
      projectDetails: {
        expansionTiming: "2016.6 이후 진출",
        targetCountries: "미국",
        expansionReason: "국내 경쟁 심화",
        services: ["개설운영_신설", "컨설팅"],
        projectName: "K-Med 프로젝트",
        reportingAwareness1: "예",
        reportingAwareness2: "",
        departments: ["내과", "외과"],
        hasEvidence: "네",
      },
      policyNeeds: {
        difficultiesRank: ["자금 조달의 어려움", "해외 정보 부족"],
        difficultiesOther: "자금 조달이 가장 큰 어려움",
        supportNeedsRank: ["컨설팅 지원", "기타"],
        supportNeedsOther: "현지 전문 파트너 매칭 지원",
        desiredSupport: "인력 매칭을 위한 플랫폼 운영",
        awareness: "방문",
        additionalComments: "신속한 지원이 필요합니다.",
      },
    },
    piiData: {
      name: "홍길동",
      tel: "02-123-4567",
      mobile: "010-1111-2222",
      email: "test@example.com",
      address: "서울특별시", 
    },
  },
  {
    id: "r2",
    submittedAt: "2024-01-02T00:00:00Z",
    responseData: {
      basicInfo: { position: "매니저" },
      expansionInfo: {
        orgType: "회사",
        medicalOrgName: "",
        medicalOrgCategory: "",
        foundationType: "",
        legalType: "",
        companyName: "메디컬코리아",
        companyCategory: "의료기기",
      },
      projectDetails: {
        expansionTiming: "진출 기획·발굴",
        targetCountries: "베트남, 태국",
        expansionReason: "해외 파트너 요청",
        services: ["컨설팅"],
        projectName: "",
        reportingAwareness1: "",
        reportingAwareness2: "아니오",
        departments: ["내과"],
        hasEvidence: "아니오",
      },
      policyNeeds: {
        difficultiesRank: ["해외 정보 부족", "자금 조달의 어려움", "기타"],
        difficultiesOther: "현지 법규 파악이 어렵습니다.",
        supportNeedsRank: [
          "현지 문화, 법, 정책, 동향 등 유관 정보 지원",
          "컨설팅 지원"
        ],
        supportNeedsOther: "",
        desiredSupport: "성공/실패 사례 공유",
        awareness: "들어봄",
        additionalComments: "상세한 데이터 공유를 부탁드립니다.",
      },
    },
    piiData: {
      name: "김관리",
      tel: "031-000-0000",
      mobile: "010-3333-4444",
      email: "manager@example.com",
      address: "경기도 성남시",
    },
  },
]

describe("aggregateSurveyResponses", () => {
  const result = aggregateSurveyResponses(questions, entries)
  const stats = result.statsByQuestion

  it("aggregates multi-choice selections with readable labels", () => {
    const multi = stats.get("B4")
    expect(multi).toBeTruthy()
    expect(multi?.answeredCount).toBe(2)

    const consulting = multi?.optionStats.find((item) => item.value === "컨설팅")
    const setup = multi?.optionStats.find((item) => item.value === "개설운영_신설")

    expect(consulting?.displayValue).toBe("운영 컨설팅")
    expect(consulting?.count).toBe(2)
    expect(setup?.displayValue).toBe("의료기관 개설·운영 (신설)")
    expect(setup?.count).toBe(1)
  })

  it("computes rank-choice scores using schema weights", () => {
    const rank = stats.get("C1")
    expect(rank).toBeTruthy()
    expect(rank?.answeredCount).toBe(2)

    const capital = rank?.optionStats.find((item) => item.value === "자금 조달의 어려움")
    const info = rank?.optionStats.find((item) => item.value === "해외 정보 부족")

    expect(capital?.totalScore).toBe(17)
    expect(capital?.averageScore).toBeCloseTo(8.5)
    expect(info?.totalScore).toBe(17)
    expect(rank?.otherTexts[0]).toContain("자금 조달이 가장 큰 어려움")
  })

  it("redacts sensitive PII fields while keeping counts", () => {
    const nameStats = stats.get("name")
    expect(nameStats).toBeTruthy()
    expect(nameStats?.isSensitive).toBe(true)
    expect(nameStats?.answeredCount).toBe(2)
    expect(nameStats?.optionStats.length).toBe(0)
  })

  it("captures recent text answers for narrative fields", () => {
    const comments = stats.get("C5")
    expect(comments).toBeTruthy()
    expect(comments?.answeredCount).toBe(2)
    expect(comments?.sampleValues).toContain("신속한 지원이 필요합니다.")
    expect(comments?.sampleValues).toContain("상세한 데이터 공유를 부탁드립니다.")
  })
})
