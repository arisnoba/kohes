"use client"

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react"
import { submitSurveyResponse } from "@/lib/supabase/responses"

export interface BasicInfoState {
  name: string
  position: string
  tel: string
  mobile: string
  email: string
  address: string
}

export interface ExpansionInfoState {
  orgType: string
  medicalOrgName: string
  medicalOrgCategory: string
  foundationType: string
  legalType: string
  companyName: string
  companyCategory: string
}

export interface ProjectDetailsState {
  expansionTiming: string
  targetCountries: string
  expansionReason: string
  services: string[]
  projectName: string
  reportingAwareness1: string
  reportingAwareness2: string
  departments: string[]
  hasEvidence: string
}

export interface PolicyNeedsState {
  difficultiesRank: string[]
  difficultiesOther: string
  supportNeedsRank: string[]
  supportNeedsOther: string
  desiredSupport: string
  awareness: string
  additionalComments: string
}

export interface SurveyData {
  basicInfo: BasicInfoState
  expansionInfo: ExpansionInfoState
  projectDetails: ProjectDetailsState
  policyNeeds: PolicyNeedsState
}

const baseSurveyData: SurveyData = {
  basicInfo: {
    name: "",
    position: "",
    tel: "",
    mobile: "",
    email: "",
    address: "",
  },
  expansionInfo: {
    orgType: "",
    medicalOrgName: "",
    medicalOrgCategory: "",
    foundationType: "",
    legalType: "",
    companyName: "",
    companyCategory: "",
  },
  projectDetails: {
    expansionTiming: "",
    targetCountries: "",
    expansionReason: "",
    services: [],
    projectName: "",
    reportingAwareness1: "",
    reportingAwareness2: "",
    departments: [],
    hasEvidence: "",
  },
  policyNeeds: {
    difficultiesRank: [],
    difficultiesOther: "",
    supportNeedsRank: [],
    supportNeedsOther: "",
    desiredSupport: "",
    awareness: "",
    additionalComments: "",
  },
}

function createSurveyData(partial: Partial<SurveyData> = {}): SurveyData {
  return {
    basicInfo: { ...baseSurveyData.basicInfo, ...partial.basicInfo },
    expansionInfo: { ...baseSurveyData.expansionInfo, ...partial.expansionInfo },
    projectDetails: { ...baseSurveyData.projectDetails, ...partial.projectDetails },
    policyNeeds: { ...baseSurveyData.policyNeeds, ...partial.policyNeeds },
  }
}

const defaultSurveyData = createSurveyData()

type SurveyAction =
  | {
    type: "update"
    section: keyof SurveyData
    payload: Partial<SurveyData[keyof SurveyData]>
  }
  | { type: "replace"; payload: SurveyData }
  | { type: "reset" }

function surveyReducer(state: SurveyData, action: SurveyAction): SurveyData {
  switch (action.type) {
    case "update": {
      const currentSection = state[action.section]
      return {
        ...state,
        [action.section]: {
          ...currentSection,
          ...action.payload,
        },
      }
    }
    case "replace": {
      return createSurveyData(action.payload)
    }
    case "reset": {
      return createSurveyData()
    }
    default:
      return state
  }
}

export interface SurveyContextValue {
  data: SurveyData
  updateSection: <K extends keyof SurveyData>(section: K, payload: Partial<SurveyData[K]>) => void
  resetSurvey: () => void
  submitSurvey: () => Promise<{ success: boolean; error: string | null; id: string | null }>
}

const SurveyContext = createContext<SurveyContextValue | undefined>(undefined)

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(surveyReducer, defaultSurveyData)

  const value: SurveyContextValue = useMemo(() => {
    return {
      data: state,
      updateSection: (section, payload) => {
        dispatch({ type: "update", section, payload })
      },
      resetSurvey: () => dispatch({ type: "reset" }),
      submitSurvey: async () => {
        const result = await submitSurveyResponse(state)
        return result
      },
    }
  }, [state])

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>
}

export function useSurveyForm() {
  const context = useContext(SurveyContext)
  if (!context) {
    throw new Error("useSurveyForm 훅은 SurveyProvider 내부에서만 사용할 수 있습니다.")
  }
  return context
}
