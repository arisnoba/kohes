import { z } from "zod"

// Validation schemas based on survey_schema.json
// RFC 5322 compliant email validation (practical subset)
// Prevents consecutive dots, leading/trailing dots in local and domain parts
const emailRegex =
  /^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/
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
