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

