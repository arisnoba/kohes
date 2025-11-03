import { z } from "zod"
import surveySchema from "../../../survey_schema.json"

// Validation schemas based on survey_schema.json
// RFC 5322 compliant email validation (practical subset)
// Prevents consecutive dots, leading/trailing dots in local and domain parts
const emailRegex = /^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/
export const emailSchema = z
  .string()
  .min(1, "이메일을 입력해주세요")
  .regex(emailRegex, "올바른 이메일 형식을 입력해주세요")

export const contactSchema = z.object({
  contact_tel: z.string().min(1, "연락처 Tel.은 필수입니다"),
  contact_mobile: z.string().min(1, "연락처 Mobile.은 필수입니다"),
  contact_email: emailSchema,
})

export type SurveyResponse = z.infer<typeof contactSchema>

// Validation rules from survey_schema.json
export function validateSurveyResponse(data: Record<string, unknown>): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  // Global validation rules
  const validationRules = surveySchema.validation_global || []

  for (const rule of validationRules) {
    if (rule.rule === "when") {
      const condition = rule.params.if
      const thenRequired = rule.params.then_required

      if (condition && thenRequired && Object.entries(condition).every(([key, value]) => data[key] === value)) {
        for (const field of thenRequired) {
          if (!data[field]) {
            errors[field] = "필수 항목입니다"
          }
        }
      }
    } else if (rule.rule === "when_any") {
      const condition = rule.params.if_any
      const thenRequired = rule.params.then_required

      if (condition && thenRequired) {
        for (const [key, values] of Object.entries(condition)) {
          if (Array.isArray(values) && values.includes(String(data[key]))) {
            for (const field of thenRequired) {
              if (!data[field]) {
                errors[field] = "필수 항목입니다"
              }
            }
          }
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

