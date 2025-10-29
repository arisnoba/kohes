import surveySchema from "../../../survey_schema.json"

export type SurveySchema = typeof surveySchema

export function getSurveySchema(): SurveySchema {
  return surveySchema
}

export function getSection(sectionId: string) {
  return surveySchema.sections.find((section) => section.id === sectionId)
}

export function getQuestion(sectionId: string, questionId: string) {
  const section = getSection(sectionId)
  if (!section) return undefined

  const findQuestion = (questions: any[]): any => {
    for (const question of questions) {
      if (question.id === questionId) {
        return question
      }
      if (question.questions) {
        const found = findQuestion(question.questions)
        if (found) return found
      }
    }
    return undefined
  }

  return findQuestion(section.questions)
}

export interface SurveyQuestionSummary {
  sectionId: string
  sectionTitle: string
  questionId: string
  questionLabel: string
  questionType: string
  required: boolean
  options: string[]
  optionCount: number
  path: string[]
  showIf?: Record<string, unknown>
  showIfAny?: Record<string, unknown>
  notes?: string
  help?: string
  rankCount?: number
  allowDuplicates?: boolean
  scoring?: unknown
}

export function getSurveyQuestionSummaries(): SurveyQuestionSummary[] {
  const summaries: SurveyQuestionSummary[] = []

  for (const section of surveySchema.sections) {
    const sectionId = section.id
    const sectionTitle = section.title ?? section.id

    const traverse = (questions: any[] = [], ancestors: string[] = []) => {
      for (const question of questions) {
        if (!question) continue

        if (question.type === "group") {
          const nextAncestors = [...ancestors]
          if (question.label) {
            nextAncestors.push(question.label)
          } else if (question.id) {
            nextAncestors.push(question.id)
          }
          traverse(question.questions ?? [], nextAncestors)
          continue
        }

        if (!question.id) continue

        const options = Array.isArray(question.options)
          ? question.options
              .map((option: any) => {
                if (typeof option === "string") {
                  return option
                }
                if (option?.label) {
                  return option.label
                }
                if (option?.value) {
                  return option.value
                }
                return undefined
              })
              .filter((value): value is string => Boolean(value))
          : []

        const normalizedAncestors = ancestors.filter((item) => Boolean(item))

        summaries.push({
          sectionId,
          sectionTitle,
          questionId: question.id,
          questionLabel: question.label ?? question.id,
          questionType: question.type ?? "text",
          required: Boolean(question.required),
          options,
          optionCount: options.length,
          path: normalizedAncestors,
          showIf: question.show_if,
          showIfAny: question.show_if_any,
          notes: question.notes,
          help: question.help,
          rankCount: question.rank_count,
          allowDuplicates: question.allow_duplicates,
          scoring: question.scoring
        })
      }
    }

    traverse(section.questions ?? [], [])
  }

  return summaries
}

