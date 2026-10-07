import { describe, expect, it, vi } from "vitest"
import { validateSurveyData } from "../../src/lib/validation/survey-data"
import { getSurveyQuestionSummaries } from "../../src/lib/survey/schema-loader"
import { separatePIIData } from "../../src/lib/survey/submission"
import { buildOrderedExportData } from "../../src/lib/admin/export-utils"
import type { SurveyData } from "../../src/components/survey/SurveyProvider"

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseServerClient: () => {
    throw new Error("Database access is forbidden in unit tests")
  },
}))

function response(): SurveyData {
  return {
    basicInfo: {
      eligible: "예",
      privacyConsent: "동의합니다",
      name: "테스트",
      position: "팀장",
      tel: "02-1234-5678",
      mobile: "010-1234-5678",
      email: "test@example.com",
      address: "서울",
    },
    expansionInfo: {
      orgType: "의료기관",
      medicalOrgName: "테스트병원",
      medicalOrgCategory: "병원",
      foundationType: "법인",
      legalType: "의료법인",
      legalName: "테스트법인",
      companyName: "",
      companyCategory: "",
      companyCategoryOther: "",
    },
    projectDetails: {
      expansionTiming: "2016.6 이후 진출",
      expansionTimingOther: "",
      targetCountries: "베트남",
      expansionReason: "해외 사업을 통한 매출, 수익 확대",
      expansionReasonOther: "",
      services: ["개설운영_신설"],
      servicesOther: "",
      projectName: "",
      reportingAwareness1: "예",
      reportingAwareness2: "",
      departments: ["내과"],
      departmentsOther: "",
      hasEvidence: "",
    },
    policyNeeds: {
      difficultiesRank: ["사업자금 확보 및 자금관리의 어려움"],
      difficultiesOther: "",
      supportNeedsRank: ["현지 파트너 발굴 및 검증 지원"],
      supportNeedsOther: "",
      desiredSupport: "",
      desiredSupportOther: "",
      awareness: "들어본 적 없다.",
      additionalComments: "",
    },
  }
}

describe("2026 survey flow", () => {
  it("accepts the medical corporation flow without retired questions", () => {
    expect(validateSurveyData(response()).errors).toEqual({})
  })
  it("accepts the company flow and all expansion stages", () => {
    const data = response()
    Object.assign(data.expansionInfo, {
      orgType: "회사(의약품, 의료기기 화장품, MSO 등)",
      companyName: "테스트회사",
      companyCategory: "화장품",
      medicalOrgName: "",
      legalName: "",
    })
    for (const expansionTiming of [
      "2016.6 이전 진출",
      "2016.6 이후 진출",
      "진출 진행 중(법인 설립/현지 공사/인허가 진행 등)",
      "진출 기획/발굴 단계(시장조사 등)",
      "기타",
    ]) {
      Object.assign(data.projectDetails, { expansionTiming, expansionTimingOther: "테스트" })
      expect(validateSurveyData(data).isValid).toBe(true)
      data.projectDetails.reportingAwareness1 = ""
      expect(validateSurveyData(data).errors).toHaveProperty("B5_1_1_1")
      data.projectDetails.reportingAwareness1 = "아니오"
    }
  })
  it("rejects non-targets and incomplete or malformed payloads", () => {
    const data = response()
    data.basicInfo.eligible = "아니오"
    expect(validateSurveyData(data).errors).toHaveProperty("eligible")
    expect(validateSurveyData(null).isValid).toBe(false)
    expect(validateSurveyData({}).isValid).toBe(false)
  })
  it("requires corporation name only for corporations and details for other options", () => {
    const data = response()
    data.expansionInfo.legalName = ""
    expect(validateSurveyData(data).errors).toHaveProperty("A2_legal_name")
    data.expansionInfo.foundationType = "개인"
    expect(validateSurveyData(data).isValid).toBe(true)
    data.expansionInfo.medicalOrgCategory = "기타"
    expect(validateSurveyData(data).errors).toHaveProperty("A2_org_type")
    data.expansionInfo.medicalOrgCategoryOther = "기타기관"
    expect(validateSurveyData(data).isValid).toBe(true)
  })
  it("accepts 1 to 3 ranked options and rejects zero, duplicates, excessive or unknown choices", () => {
    const data = response()
    for (const ranks of [
      [],
      ["알 수 없는 항목"],
      Array(2).fill(data.policyNeeds.difficultiesRank[0]),
      Array(4).fill(data.policyNeeds.difficultiesRank[0]),
    ]) {
      data.policyNeeds.difficultiesRank = ranks
      expect(validateSurveyData(data).errors).toHaveProperty("C1")
    }
    data.policyNeeds.difficultiesRank = [
      "사업자금 확보 및 자금관리의 어려움",
      "현지 시장정보 확보 및 사업성 판단의 어려움",
      "기타",
    ]
    expect(validateSurveyData(data).errors).toHaveProperty("C1")
    data.policyNeeds.difficultiesOther = "추가 의견"
    expect(validateSurveyData(data).isValid).toBe(true)
  })
  it("rejects refusal and still strips stale personal and retired responses", () => {
    const data = response()
    data.basicInfo.privacyConsent = "동의하지 않습니다"
    data.basicInfo.email = ""
    data.projectDetails.projectName = "이전 사업명"
    data.policyNeeds.desiredSupport = "이전 응답"
    expect(validateSurveyData(data).errors).toHaveProperty("privacyConsent")
    const payload = separatePIIData(data)
    expect(payload.piiData).toBeNull()
    expect(payload.responseData.basicInfo.position).toBe("")
    expect(payload.responseData.surveyYear).toBe(2026)
    expect(payload.responseData.projectDetails).not.toHaveProperty("projectName")
    expect(payload.responseData.policyNeeds).not.toHaveProperty("desiredSupport")
  })
  it("exports screening, consent, corporation name and other details without retired columns", () => {
    const data = response()
    data.expansionInfo.legalType = "기타"
    data.expansionInfo.legalTypeOther = "테스트 유형"
    const { responseData, piiData } = separatePIIData(data)
    const [row] = buildOrderedExportData(
      [{ id: "test", submittedAt: "2026-10-07", responseData, piiData }],
      "response"
    )
    expect(row["법인명"]).toBe("테스트법인")
    expect(row["법인 유형"]).toBe("기타 : 테스트 유형")
    expect(row["개인정보 수집 및 이용 동의"]).toBe("동의합니다")
    const ids = getSurveyQuestionSummaries().map((q) => q.questionId)
    for (const id of ["B5_1_1", "B5_2", "B7", "C3"]) expect(ids).not.toContain(id)
  })
})
