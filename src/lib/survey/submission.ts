import surveySchema from "../../../survey_schema.json"
import type { SurveyData } from "@/components/survey/SurveyProvider"
/**
 * PII(개인식별정보)와 응답 데이터를 분리하는 함수
 * PRD 8조: PII 분리 저장 원칙 준수
 */
export function separatePIIData(data: SurveyData) {
  // PII: 성명, 연락처(Tel, Mobile, Email), 주소
  const piiData =
    data.basicInfo.privacyConsent === "동의하지 않습니다"
      ? null
      : {
          name: data.basicInfo.name,
          tel: data.basicInfo.tel,
          mobile: data.basicInfo.mobile,
          email: data.basicInfo.email,
          address: data.basicInfo.address,
        }
  const { projectName, reportingAwareness2, hasEvidence, ...projectDetails } = data.projectDetails
  const { desiredSupport, desiredSupportOther, ...policyNeeds } = data.policyNeeds
  const expansionInfo = { ...data.expansionInfo }
  if (expansionInfo.orgType === "의료기관") {
    expansionInfo.companyName = ""
    expansionInfo.companyCategory = ""
    expansionInfo.companyCategoryOther = ""
    if (expansionInfo.foundationType !== "법인") {
      expansionInfo.legalType = ""
      expansionInfo.legalTypeOther = ""
      expansionInfo.legalName = ""
    }
  } else {
    expansionInfo.medicalOrgName = ""
    expansionInfo.medicalOrgCategory = ""
    expansionInfo.medicalOrgCategoryOther = ""
    expansionInfo.foundationType = ""
    expansionInfo.foundationTypeOther = ""
    expansionInfo.legalType = ""
    expansionInfo.legalTypeOther = ""
    expansionInfo.legalName = ""
  }

  // 응답 데이터: PII를 제외한 모든 설문 응답
  const responseData = {
    surveyVersion: surveySchema.metadata.version,
    surveyYear: 2026,
    basicInfo: {
      eligible: data.basicInfo.eligible,
      privacyConsent: data.basicInfo.privacyConsent,
      position:
        data.basicInfo.privacyConsent === "동의하지 않습니다" ? "" : data.basicInfo.position,
    },
    expansionInfo,
    projectDetails,
    policyNeeds,
  }

  return { piiData, responseData }
}

/**
 * 설문 응답을 서버에 제출하는 함수 (클라이언트 사용)
 */
export async function submitSurveyResponse(data: SurveyData) {
  try {
    const response = await fetch("/api/survey/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ surveyData: data, submissionKey: getSubmissionKey(data) }),
    })

    if (!response.ok) {
      let errorMessage = response.statusText
      try {
        const errorBody = await response.json()
        if (errorBody?.error) {
          errorMessage = errorBody.error
        }
      } catch (parseError) {
        // 응답 본문이 JSON이 아닐 수 있으므로 무시
      }

      return { success: false, error: errorMessage, id: null }
    }

    const result = (await response.json()) as { success?: boolean; id?: string }
    return {
      success: Boolean(result.success),
      error: null,
      id: result.id ?? null,
    }
  } catch (error) {
    console.error("설문 제출 오류:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "설문 제출 중 오류가 발생했습니다",
      id: null,
    }
  }
}

let pendingSubmission: { body: string; key: string } | undefined
function getSubmissionKey(data: SurveyData) {
  const body = JSON.stringify(data)
  if (!pendingSubmission || pendingSubmission.body !== body)
    pendingSubmission = { body, key: crypto.randomUUID() }
  return pendingSubmission.key
}
