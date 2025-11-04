"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import type { SurveyData } from "@/components/survey/SurveyProvider"
import { useSurveyForm } from "@/components/survey/SurveyProvider"

type StepConfig = {
  id: SurveyStepId
  path: string
  isComplete: (data: SurveyData) => boolean
}

type SurveyStepId = "basic-info" | "expansion-info" | "project-details" | "policy-needs" | "complete"
export type GuardStep = Exclude<SurveyStepId, "basic-info">

const STEP_SEQUENCE: StepConfig[] = [
  {
    id: "basic-info",
    path: "/basic-info",
    isComplete: (data) => isBasicInfoComplete(data),
  },
  {
    id: "expansion-info",
    path: "/expansion-info",
    isComplete: (data) => isExpansionInfoComplete(data),
  },
  {
    id: "project-details",
    path: "/project-details",
    isComplete: (data) => isProjectDetailsComplete(data),
  },
  {
    id: "policy-needs",
    path: "/policy-needs",
    isComplete: (data) => isPolicyNeedsComplete(data),
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
    if (skipValidation) {
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

function isBasicInfoComplete(data: SurveyData) {
  const { basicInfo } = data

  return (
    isNonEmpty(basicInfo.name) &&
    isNonEmpty(basicInfo.position) &&
    isNonEmpty(basicInfo.tel) &&
    isNonEmpty(basicInfo.mobile) &&
    isNonEmpty(basicInfo.email)
  )
}

function isExpansionInfoComplete(data: SurveyData) {
  const { expansionInfo } = data

  if (!expansionInfo.orgType) {
    return false
  }

  if (expansionInfo.orgType === "의료기관") {
    return (
      isNonEmpty(expansionInfo.medicalOrgName) &&
      Boolean(expansionInfo.medicalOrgCategory) &&
      Boolean(expansionInfo.foundationType) &&
      (expansionInfo.foundationType !== "법인" || Boolean(expansionInfo.legalType))
    )
  }

  if (expansionInfo.orgType === "회사(MSO 등)") {
    const hasBasicFields = isNonEmpty(expansionInfo.companyName) && Boolean(expansionInfo.companyCategory)
    // "기타" 선택 시 상세 입력 필수
    if (expansionInfo.companyCategory === "기타") {
      return hasBasicFields && isNonEmpty(expansionInfo.companyCategoryOther)
    }
    return hasBasicFields
  }

  return false
}

function isProjectDetailsComplete(data: SurveyData) {
  const { projectDetails } = data

  if (!projectDetails.expansionTiming) return false
  if (!isNonEmpty(projectDetails.targetCountries)) return false
  if (!projectDetails.expansionReason) return false
  if (projectDetails.services.length === 0) return false

  const needsProjectInfo =
    projectDetails.expansionTiming === "2016.6 이전 진출" ||
    projectDetails.expansionTiming === "2016.6 이후 진출" ||
    projectDetails.expansionTiming === "진출 진행 중(법인 설립/현지 공사/인허가 진행 등)"

  const needsReportingAwareness2 =
    projectDetails.expansionTiming === "진출 기획/발굴 단계(시장조사 등)" ||
    projectDetails.expansionTiming === "기타"

  if (needsProjectInfo) {
    if (!isNonEmpty(projectDetails.projectName) || !projectDetails.reportingAwareness1) {
      return false
    }
  }

  if (needsReportingAwareness2) {
    if (!projectDetails.reportingAwareness2) {
      return false
    }
  }

  if (!projectDetails.hasEvidence) {
    return false
  }

  return true
}

function isPolicyNeedsComplete(data: SurveyData) {
  const { policyNeeds } = data

  if (policyNeeds.difficultiesRank.length === 0) return false
  if (policyNeeds.supportNeedsRank.length === 0) return false
  if (!policyNeeds.desiredSupport) return false
  if (!policyNeeds.awareness) return false

  return true
}

function isNonEmpty(value: string) {
  return value.trim().length > 0
}
