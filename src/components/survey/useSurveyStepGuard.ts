"use client"

import { validateSurveyData } from "@/lib/validation/survey-data"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import type { SurveyData } from "@/components/survey/SurveyProvider"
import { useSurveyForm } from "@/components/survey/SurveyProvider"

type StepConfig = {
  id: SurveyStepId
  path: string
  isComplete: (data: SurveyData) => boolean
}

type SurveyStepId =
  | "intro"
  | "eligibility"
  | "consent"
  | "basic-info"
  | "expansion-info"
  | "project-details"
  | "policy-needs"
  | "complete"
export type GuardStep = Exclude<SurveyStepId, "intro">

const STEP_SEQUENCE: StepConfig[] = [
  {
    id: "intro",
    path: "/intro",
    isComplete: () => true,
  },
  {
    id: "eligibility",
    path: "/eligibility",
    isComplete: (data) => validateSurveyData(data, "eligibility").isValid,
  },
  {
    id: "consent",
    path: "/consent",
    isComplete: (data) => data.basicInfo.privacyConsent === "동의합니다",
  },
  {
    id: "basic-info",
    path: "/basic-info",
    isComplete: (data) => validateSurveyData(data, "intro").isValid,
  },
  {
    id: "expansion-info",
    path: "/expansion-info",
    isComplete: (data) => validateSurveyData(data, "A").isValid,
  },
  {
    id: "project-details",
    path: "/project-details",
    isComplete: (data) => validateSurveyData(data, "B").isValid,
  },
  {
    id: "policy-needs",
    path: "/policy-needs",
    isComplete: (data) => validateSurveyData(data, "C").isValid,
  },
  {
    id: "complete",
    path: "/complete",
    isComplete: () => true,
  },
]

export function useSurveyStepGuard(step: GuardStep) {
  const router = useRouter()
  const { data, skipValidation } = useSurveyForm()
  const [isAccessible, setIsAccessible] = useState(false)

  useEffect(() => {
    if (step === "complete" && data.basicInfo.eligible === "아니오") {
      setIsAccessible(true)
      return
    }

    if (
      skipValidation &&
      data.basicInfo.eligible === "예" &&
      data.basicInfo.privacyConsent === "동의합니다"
    ) {
      setIsAccessible(true)
      return
    }

    const currentIndex = STEP_SEQUENCE.findIndex((item) => item.id === step)
    if (currentIndex === -1) {
      setIsAccessible(true)
      return
    }

    const incompleteStep = STEP_SEQUENCE.slice(0, currentIndex).find(
      (item) => !item.isComplete(data)
    )

    if (incompleteStep) {
      setIsAccessible(false)
      router.replace(incompleteStep.path)
      return
    }

    setIsAccessible(true)
  }, [data, router, skipValidation, step])

  return isAccessible
}
