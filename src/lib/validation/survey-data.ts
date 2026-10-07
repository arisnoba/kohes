import surveySchema from "../../../survey_schema.json"
import { emailSchema } from "./survey"
import { mobileRegex, telRegex } from "./phone"

const fieldPaths: Record<string, [string, string]> = {
  eligible: ["basicInfo", "eligible"],
  privacyConsent: ["basicInfo", "privacyConsent"],
  name: ["basicInfo", "name"],
  position: ["basicInfo", "position"],
  contact_tel: ["basicInfo", "tel"],
  contact_mobile: ["basicInfo", "mobile"],
  contact_email: ["basicInfo", "email"],
  address: ["basicInfo", "address"],
  A1: ["expansionInfo", "orgType"],
  A2_org_name: ["expansionInfo", "medicalOrgName"],
  A2_org_type: ["expansionInfo", "medicalOrgCategory"],
  A2_found_type: ["expansionInfo", "foundationType"],
  A2_legal_subtype: ["expansionInfo", "legalType"],
  A2_legal_name: ["expansionInfo", "legalName"],
  A3_company_name: ["expansionInfo", "companyName"],
  A3_company_type: ["expansionInfo", "companyCategory"],
  B1: ["projectDetails", "expansionTiming"],
  B2: ["projectDetails", "targetCountries"],
  B3: ["projectDetails", "expansionReason"],
  B4: ["projectDetails", "services"],
  B5_1_1_1: ["projectDetails", "reportingAwareness1"],
  B6: ["projectDetails", "departments"],
  C1: ["policyNeeds", "difficultiesRank"],
  C2: ["policyNeeds", "supportNeedsRank"],
  C4: ["policyNeeds", "awareness"],
  C5: ["policyNeeds", "additionalComments"],
}
const otherFields: Record<string, string> = {
  A2_org_type: "medicalOrgCategoryOther",
  A2_found_type: "foundationTypeOther",
  A2_legal_subtype: "legalTypeOther",
  A3_company_type: "companyCategoryOther",
  B1: "expansionTimingOther",
  B3: "expansionReasonOther",
  B4: "servicesOther",
  B6: "departmentsOther",
  C1: "difficultiesOther",
  C2: "supportNeedsOther",
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

interface Question {
  id: string
  label: string
  type: string
  required?: boolean
  options?: (string | { value: string })[]
  questions?: Question[]
  show_if?: Record<string, string>
  min_required?: number
  rank_count?: number
}

// Shared by navigation guards and the submission API; no database access.
export function validateSurveyData(input: unknown, sectionId?: string) {
  const data = record(input)
  const basicInfo = record(data.basicInfo)
  const flat: Record<string, unknown> = {}
  for (const [id, [section, field]] of Object.entries(fieldPaths))
    flat[id] = record(data[section])[field]
  const errors: Record<string, string> = {}
  const isText = (value: unknown): value is string =>
    typeof value === "string" && Boolean(value.trim())

  const validate = (questions: Question[]) => {
    for (const question of questions) {
      if (
        question.show_if &&
        !Object.entries(question.show_if).every(([id, value]) => flat[id] === value)
      )
        continue
      if (question.type === "group") {
        validate(question.questions ?? [])
        continue
      }
      if (
        basicInfo.privacyConsent === "동의하지 않습니다" &&
        ["name", "position", "contact_tel", "contact_mobile", "contact_email", "address"].includes(
          question.id
        )
      )
        continue
      const value = flat[question.id]
      const options = (question.options ?? []).map((option) =>
        typeof option === "string" ? option : option.value
      )
      const fail = () => {
        errors[question.id] = `${question.label}: 응답을 확인해주세요.`
      }
      if (question.type === "multi_choice" || question.type === "rank_choice") {
        if (
          !Array.isArray(value) ||
          (question.required && value.length < (question.min_required ?? 1)) ||
          (question.rank_count && value.length > question.rank_count) ||
          new Set(value).size !== value.length ||
          value.some((item) => typeof item !== "string" || !options.includes(item))
        ) {
          fail()
          continue
        }
      } else if (
        (question.required && !isText(value)) ||
        (value !== undefined && typeof value !== "string") ||
        (question.type === "single_choice" && !options.includes(value as string))
      ) {
        fail()
        continue
      }
      const hasOther =
        value === "기타" ||
        value === "그 외 국제의료사업" ||
        (Array.isArray(value) &&
          value.some((item) => item === "기타" || item === "그 외 국제의료사업"))
      if (hasOther && otherFields[question.id]) {
        const [section] = fieldPaths[question.id]
        if (!isText(record(data[section])[otherFields[question.id]])) fail()
      }
      if (question.id === "contact_email" && !emailSchema.safeParse(value).success) fail()
      if (question.id === "contact_tel" && (typeof value !== "string" || !telRegex.test(value)))
        fail()
      if (
        question.id === "contact_mobile" &&
        (typeof value !== "string" || !mobileRegex.test(value))
      )
        fail()
    }
  }
  for (const section of surveySchema.sections) {
    if (!sectionId || section.id === sectionId) validate(section.questions as Question[])
  }
  if ((!sectionId || sectionId === "eligibility") && basicInfo.eligible !== "예")
    errors.eligible = "조사 대상 기관만 응답할 수 있습니다."
  if ((!sectionId || sectionId === "intro") && basicInfo.privacyConsent !== "동의합니다")
    errors.privacyConsent = "개인정보 수집 및 이용에 동의해야 설문에 참여할 수 있습니다."
  return { isValid: Object.keys(errors).length === 0, errors }
}
