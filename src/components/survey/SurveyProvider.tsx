"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react"
import { submitSurveyResponse } from "@/lib/survey/submission"
import { DevTools } from "./DevTools"

export interface BasicInfoState {
  eligible?: string
  privacyConsent?: string
  name: string
  position: string
  tel: string
  mobile: string
  email: string
  address: string
}

export interface ExpansionInfoState {
  medicalOrgCategoryOther?: string
  foundationTypeOther?: string
  legalTypeOther?: string
  legalName?: string
  orgType: string
  medicalOrgName: string
  medicalOrgCategory: string
  foundationType: string
  legalType: string
  companyName: string
  companyCategory: string
  companyCategoryOther: string
}

export interface ProjectDetailsState {
  expansionTiming: string
  expansionTimingOther: string
  targetCountries: string
  expansionReason: string
  expansionReasonOther: string
  services: string[]
  servicesOther: string
  projectName: string
  reportingAwareness1: string
  reportingAwareness2: string
  departments: string[]
  departmentsOther: string
  hasEvidence: string
}

export interface PolicyNeedsState {
  difficultiesRank: string[]
  difficultiesOther: string
  supportNeedsRank: string[]
  supportNeedsOther: string
  desiredSupport: string
  desiredSupportOther: string
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
    eligible: "",
    privacyConsent: "",
    name: "",
    position: "",
    tel: "",
    mobile: "",
    email: "",
    address: "",
  },
  expansionInfo: {
    medicalOrgCategoryOther: "",
    foundationTypeOther: "",
    legalTypeOther: "",
    legalName: "",
    orgType: "",
    medicalOrgName: "",
    medicalOrgCategory: "",
    foundationType: "",
    legalType: "",
    companyName: "",
    companyCategory: "",
    companyCategoryOther: "",
  },
  projectDetails: {
    expansionTiming: "",
    expansionTimingOther: "",
    targetCountries: "",
    expansionReason: "",
    expansionReasonOther: "",
    services: [],
    servicesOther: "",
    projectName: "",
    reportingAwareness1: "",
    reportingAwareness2: "",
    departments: [],
    departmentsOther: "",
    hasEvidence: "",
  },
  policyNeeds: {
    difficultiesRank: [],
    difficultiesOther: "",
    supportNeedsRank: [],
    supportNeedsOther: "",
    desiredSupport: "",
    desiredSupportOther: "",
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

const mockSurveyData = createSurveyData({
  basicInfo: {
    eligible: "예",
    privacyConsent: "동의합니다",
    name: "관리자 테스트",
    position: "팀장",
    tel: "02-1234-5678",
    mobile: "010-1234-5678",
    email: "dev@example.com",
    address: "서울특별시 중구 세종대로 110",
  },
  expansionInfo: {
    orgType: "의료기관",
    medicalOrgName: "서울케어병원",
    medicalOrgCategory: "상급종합병원",
    foundationType: "법인",
    legalType: "의료법인",
    legalName: "테스트 의료법인",
    companyName: "",
    companyCategory: "",
    companyCategoryOther: "",
  },
  projectDetails: {
    expansionTiming: "2016.6 이후 진출",
    expansionTimingOther: "",
    targetCountries: "미국, 중국",
    expansionReason: "해외 사업을 통한 매출, 수익 확대",
    expansionReasonOther: "",
    services: ["개설운영_신설", "정보시스템 이전"],
    servicesOther: "",
    projectName: "글로벌 클리닉 프로젝트",
    reportingAwareness1: "예",
    reportingAwareness2: "",
    departments: ["내과", "일반외과"],
    departmentsOther: "",
    hasEvidence: "네",
  },
  policyNeeds: {
    difficultiesRank: [
      "사업자금 확보 및 자금관리의 어려움",
      "현지 시장정보 확보 및 사업성 판단의 어려움",
    ],
    difficultiesOther: "",
    supportNeedsRank: [
      "현지 문화, 법, 정책, 동향 등 유관 정보 지원",
      "의료 해외진출 사업 수행을 위한 컨설팅 지원",
    ],
    supportNeedsOther: "",
    desiredSupport: "성공 및 실패 사례 공유",
    desiredSupportOther: "",
    awareness: "방문한 적 있다.",
    additionalComments: "테스트용 더미 데이터입니다.",
  },
})

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
  autoFillSurvey: () => void
  skipValidation: boolean
  setSkipValidation: (skip: boolean) => void
}

const SurveyContext = createContext<SurveyContextValue | undefined>(undefined)

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(surveyReducer, defaultSurveyData)
  const [skipValidation, setSkipValidation] = useState(false)

  const handleSkipValidationChange = useCallback((skip: boolean) => {
    setSkipValidation(skip)
  }, [])

  const autoFillSurvey = useCallback(() => {
    dispatch({ type: "replace", payload: mockSurveyData })
  }, [dispatch])

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
      autoFillSurvey,
      skipValidation,
      setSkipValidation: handleSkipValidationChange,
    }
  }, [autoFillSurvey, handleSkipValidationChange, skipValidation, state])

  return (
    <SurveyContext.Provider value={value}>
      {children}
      {process.env.NODE_ENV !== "production" ? (
        <DevTools
          onAutoFill={autoFillSurvey}
          skipValidation={skipValidation}
          onSkipValidationChange={handleSkipValidationChange}
        />
      ) : null}
    </SurveyContext.Provider>
  )
}

export function useSurveyForm() {
  const context = useContext(SurveyContext)
  if (!context) {
    throw new Error("useSurveyForm 훅은 SurveyProvider 내부에서만 사용할 수 있습니다.")
  }
  return context
}
