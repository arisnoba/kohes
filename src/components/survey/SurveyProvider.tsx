"use client"

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react"
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
  skipValidation: boolean
  setSkipValidation: (skip: boolean) => void
}

const SurveyContext = createContext<SurveyContextValue | undefined>(undefined)

const STORAGE_KEY = "survey-data"
const SKIP_VALIDATION_STORAGE_KEY = "survey-skip-validation"

export function SurveyProvider({ children }: { children: ReactNode }) {
  // 초기 상태를 기본값으로 설정 (서버와 클라이언트 동일)
  const [state, dispatch] = useReducer(surveyReducer, defaultSurveyData)
  const [isMounted, setIsMounted] = useState(false)
  const [skipValidation, setSkipValidation] = useState(() =>
    process.env.NODE_ENV !== "production"
  )

  // 클라이언트 마운트 후에만 sessionStorage에서 데이터 로드
  useEffect(() => {
    setIsMounted(true)
    if (typeof window === "undefined") return

    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const loadedData = createSurveyData(parsed ?? {})
        dispatch({ type: "replace", payload: loadedData })
      }
      const storedSkip = window.sessionStorage.getItem(SKIP_VALIDATION_STORAGE_KEY)
      if (storedSkip !== null) {
        setSkipValidation(storedSkip === "true")
      } else {
        setSkipValidation(process.env.NODE_ENV !== "production")
      }
    } catch (error) {
      console.warn("설문 데이터 로딩 실패", error)
    }
  }, [])

  // 상태 변경 시 sessionStorage에 저장
  useEffect(() => {
    if (!isMounted) return
    if (typeof window === "undefined") return
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, isMounted])

  useEffect(() => {
    if (!isMounted) return
    if (typeof window === "undefined") return
    window.sessionStorage.setItem(
      SKIP_VALIDATION_STORAGE_KEY,
      skipValidation ? "true" : "false"
    )
  }, [skipValidation, isMounted])

  const value: SurveyContextValue = useMemo(() => {
    return {
      data: state,
      updateSection: (section, payload) => {
        dispatch({ type: "update", section, payload })
      },
      resetSurvey: () => dispatch({ type: "reset" }),
      submitSurvey: async () => {
        const result = await submitSurveyResponse(state)
        if (result.success) {
          // 제출 성공 시 sessionStorage 정리
          if (typeof window !== "undefined") {
            window.sessionStorage.removeItem(STORAGE_KEY)
          }
        }
        return result
      },
      skipValidation,
      setSkipValidation,
    }
  }, [skipValidation, state])

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>
}

export function useSurveyForm() {
  const context = useContext(SurveyContext)
  if (!context) {
    throw new Error("useSurveyForm 훅은 SurveyProvider 내부에서만 사용할 수 있습니다.")
  }
  return context
}
