#!/usr/bin/env tsx

/**
 * Supabase 테스트 데이터 생성 스크립트
 *
 * 실행: pnpm seed-test-data [--count N]
 */

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
import readline from "readline"
import { resolve } from "path"

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") })

// ============================================================
// Configuration
// ============================================================

const DEFAULT_COUNT = 100
const BATCH_SIZE = 10

// ============================================================
// Data Pools
// ============================================================

const MEDICAL_INSTITUTIONS = [
  "서울대학교병원",
  "삼성서울병원",
  "서울아산병원",
  "세브란스병원",
  "서울성모병원",
  "강남세브란스병원",
  "분당서울대학교병원",
  "가톨릭대학교 서울성모병원",
  "고려대학교 안암병원",
  "을지대학교병원",
  "한양대학교병원",
  "경희대학교병원",
  "인하대학교병원",
  "아주대학교병원",
  "차의과대학 분당차병원",
  "순천향대학교 서울병원",
  "건국대학교병원",
  "중앙대학교병원",
  "동국대학교 일산병원",
  "가톨릭대학교 여의도성모병원",
  "가톨릭대학교 의정부성모병원",
  "가톨릭대학교 부천성모병원",
  "고려대학교 구로병원",
  "경북대학교병원",
  "부산대학교병원",
  "칠곡경북대학교병원",
  "전남대학교병원",
  "충남대학교병원",
  "서울특별시 보라매병원",
  "국립중앙의료원",
]

const COMPANY_NAMES = [
  "메디컬코리아",
  "글로벌메디케어",
  "아시아헬스케어",
  "코리아메디칼서비스",
  "인터내셔널헬스",
  "메디컬아웃소싱",
  "헬스케어파트너스",
  "글로벌헬스솔루션",
  "메디컬매니지먼트",
  "케어인터내셔널",
  "메디컬컨설팅그룹",
  "아시아메디칼",
  "코리아헬스파트너스",
  "글로벌케어솔루션",
  "메디컬서포트",
  "헬스케어익스포트",
  "메디칼매니지먼트서비스",
  "케어글로벌",
  "메디컬아웃소싱파트너스",
  "헬스케어컨설팅",
]

const COUNTRIES = [
  "베트남",
  "미얀마",
  "카자흐스탄",
  "몽골",
  "우즈베키스탄",
  "필리핀",
  "인도네시아",
  "말레이시아",
  "태국",
  "캄보디아",
  "라오스",
  "중국",
  "러시아",
  "아랍에미리트",
  "사우디아라비아",
]

const FIRST_NAMES = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
  "한",
  "오",
  "서",
  "신",
  "권",
]
const LAST_NAMES = [
  "민수",
  "영희",
  "철수",
  "지영",
  "현우",
  "수진",
  "준호",
  "미라",
  "승호",
  "은영",
  "태준",
  "서연",
  "재현",
  "하은",
  "동현",
  "유진",
  "상훈",
  "나영",
  "정훈",
  "다은",
]

// ============================================================
// Utility Functions
// ============================================================

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

function randomElements<T>(array: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = shuffle(array)
  return shuffled.slice(0, Math.min(count, array.length))
}

function randomDate(daysAgo: number): string {
  const now = new Date()
  const randomDays = Math.floor(Math.random() * daysAgo)
  const randomHours = Math.floor(Math.random() * 24)
  const randomMinutes = Math.floor(Math.random() * 60)
  const randomSeconds = Math.floor(Math.random() * 60)

  const date = new Date(now)
  date.setDate(date.getDate() - randomDays)
  date.setHours(randomHours, randomMinutes, randomSeconds)

  return date.toISOString()
}

function generateName(): string {
  return randomElement(FIRST_NAMES) + randomElement(LAST_NAMES)
}

function generatePhone(): string {
  const middle = String(Math.floor(Math.random() * 9000) + 1000)
  const last = String(Math.floor(Math.random() * 9000) + 1000)
  return `010-${middle}-${last}`
}

function generateEmail(name: string): string {
  const domains = ["gmail.com", "naver.com", "daum.net", "hanmail.net"]
  return `${name.toLowerCase()}${Math.floor(Math.random() * 1000)}@${randomElement(domains)}`
}

// ============================================================
// Survey Data Generation
// ============================================================

function generateSurveyResponse() {
  const name = generateName()
  const isHospital = Math.random() > 0.4 // 60% 의료기관, 40% 회사

  // PII Data
  const piiData = {
    name,
    tel: generatePhone(),
    mobile: generatePhone(),
    email: generateEmail(name),
    address: `서울특별시 ${randomElement(["강남구", "서초구", "송파구", "마포구", "용산구"])}`,
  }

  // Basic Info
  const position = randomElement([
    "원장",
    "병원장",
    "진료부장",
    "국제진료센터장",
    "경영기획실장",
    "대표이사",
    "부사장",
    "이사",
    "부장",
    "팀장",
    "과장",
  ])

  // A. 기관 유형
  const orgType = isHospital ? "의료기관" : "회사(MSO 등)"

  let medicalOrgName: string | undefined
  let medicalOrgCategory: string | undefined
  let foundationType: string | undefined
  let legalType: string | undefined

  let companyName: string | undefined
  let companyCategory: string | undefined

  if (isHospital) {
    medicalOrgName = randomElement(MEDICAL_INSTITUTIONS)
    medicalOrgCategory = randomElement([
      "의원",
      "치과의원",
      "한의원",
      "조산원",
      "병원",
      "치과병원",
      "한방병원",
      "요양병원",
      "종합병원(100~300병상)",
      "종합병원(300병상 초과)",
      "상급종합병원",
    ])
    foundationType = randomElement([
      "국공립",
      "법인",
      "소비자생활협동조합",
      "사회적협동조합",
      "개인",
      "군병원",
      "기타",
    ])

    if (foundationType === "법인") {
      legalType = randomElement([
        "학교법인",
        "특수법인",
        "종교법인",
        "사회복지법인",
        "사단법인",
        "재단법인",
        "회사법인",
        "의료법인",
      ])
    }
  } else {
    companyName = randomElement(COMPANY_NAMES)
    companyCategory = randomElement(["MSO(병원경영지원회사)", "의료기기", "의약품", "기타"])
  }

  const expansionInfo: any = {
    orgType,
  }

  if (isHospital) {
    expansionInfo.medicalOrgName = medicalOrgName
    expansionInfo.medicalOrgCategory = medicalOrgCategory
    expansionInfo.foundationType = foundationType
    if (legalType) {
      expansionInfo.legalType = legalType
    }
  } else {
    expansionInfo.companyName = companyName
    expansionInfo.companyCategory = companyCategory
  }

  // B. 프로젝트 세부사항
  const expansionTimingOptions = [
    "2016.6 이전 진출",
    "2016.6 이후 진출",
    "진출 진행 중(법인 설립/현지 공사/인허가 진행 등)",
    "진출 기획/발굴 단계(시장조사 등)",
    "기타",
  ]
  const expansionTiming = randomElement(expansionTimingOptions)

  const targetCountriesArray = randomElements(COUNTRIES, 1, 3)
  const targetCountries = targetCountriesArray.join(", ")

  const expansionReason = randomElement([
    "국내 경쟁 심화",
    "해외 파트너의 요청",
    "외국인환자 유치를 위한 거점 활용",
    "선교 및 자선활동의 목적",
    "기타",
  ])

  const servicesOptions = [
    "개설·운영(신설)",
    "개설·운영(인수합병)",
    "수탁운영",
    "운영컨설팅",
    "종사자 파견",
    "의료기술 이전",
    "정보시스템 이전",
    "국외 의료서비스 제공 위한 의약품 제공",
    "국외 의료서비스 제공 위한 의료기기 등 제공",
    "의료인 교육(외국의료인 국내연수)",
    "의료인 교육(국내의료진 해외 방문연수)",
    "그 외 국제의료사업",
  ]
  const services = randomElements(servicesOptions, 1, 3)

  const projectDetails: any = {
    expansionTiming,
    targetCountries,
    expansionReason,
    services,
  }

  // B5 조건부 질문
  const isProgressed = [
    "2016.6 이전 진출",
    "2016.6 이후 진출",
    "진출 진행 중(법인 설립/현지 공사/인허가 진행 등)",
  ].includes(expansionTiming)

  if (isProgressed) {
    projectDetails.projectName = `${randomElement(targetCountriesArray)} ${randomElement(["메디컬센터", "병원", "클리닉", "진료소"])} 프로젝트`
    projectDetails.reportingAwareness1 = randomElement(["예", "아니오"])
  } else {
    projectDetails.reportingAwareness2 = randomElement(["예", "아니오"])
  }

  // B6: 진출 진료과 (medical specialties)
  const specialtiesOptions = [
    "건강검진",
    "내과",
    "소아청소년과",
    "신경(외)과",
    "피부·성형",
    "정형외과",
    "산부인과",
    "안과",
    "이비인후과",
    "비뇨기과",
    "재활의학과",
    "가정의학과",
    "마취통증의학과",
    "영상의학과",
    "진단검사의학과",
    "한방",
    "치과",
    "일반외과",
    "정신과",
    "기타",
  ]
  projectDetails.departments = randomElements(specialtiesOptions, 1, 3)

  projectDetails.hasEvidence = randomElement(["네", "아니오"])

  // C. 정책 수요 (survey_schema.json의 정확한 옵션 값 사용)
  const c1Options = [
    "자금 조달의 어려움",
    "수익 예측의 불확실성",
    "현지(해외) 정보 부족",
    "현지(해외) 파트너 신뢰의 어려움 혹은 의견 불일치",
    "불안정한 현지(해외) 정치·법·제도",
    "의료 해외진출 관련 전문인력 부족",
    "현지(해외) 전문인력 고용의 어려움",
    "인허가, 면허 등 현지(해외) 법·제도 규제",
    "현지 네트워크 부재",
    "기타",
  ]
  const difficultiesRank = shuffle(c1Options).slice(0, 9) // 최대 9개 선택

  const c2Options = [
    "현지 문화·법·정책·동향 등 유관 정보 지원",
    "의료 해외진출 사업을 위한 대출 등 정책자금 지원",
    "현지 파트너 발굴 및 검증 지원",
    "의료 해외진출 관련 전문인력 역량강화를 위한 교육",
    "의료 해외진출 사업 수행을 위한 컨설팅 지원",
    "의료 해외진출을 위한 파트너링 행사 개최(수출상담회, 비즈니스 미팅 등)",
    "기 진출 의료기관 선도사례 및 진출 전략 공유",
    "한국의료 브랜드(Medical Korea) 및 우수기술 홍보",
    "기타",
  ]
  const supportNeedsRank = shuffle(c2Options).slice(0, 8) // 최대 8개 선택

  const desiredSupport = randomElement([
    "진출 기관 및 예정 기관 간의 네트워크 구축",
    "성공 및 실패 사례 공유",
    "선진국의 진출사례 공유",
    "의료 해외진출 및 신고제도 홍보",
    "인력 매칭을 위한 플랫폼 운영",
    "기타",
  ])

  const awareness = randomElement([
    "방문한 적 있다.",
    "방문한 적은 없지만, 들어본 적 있다.",
    "들어본 적 없다.",
  ])

  const additionalComments =
    Math.random() > 0.7
      ? `${randomElement(["정부의", "정책적", "체계적인", "실질적인", "맞춤형"])} 지원이 필요합니다.`
      : ""

  const policyNeeds: any = {
    difficultiesRank,
    supportNeedsRank,
    desiredSupport,
    awareness,
  }

  if (additionalComments) {
    policyNeeds.additionalComments = additionalComments
  }

  // Response Data (PII 제외)
  const responseData = {
    basicInfo: {
      position,
    },
    expansionInfo,
    projectDetails,
    policyNeeds,
  }

  return {
    submitted_at: randomDate(30),
    respondent_name: piiData.name,
    organization_name: isHospital ? medicalOrgName : companyName,
    response_data: responseData,
    pii_data: piiData,
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  // Parse arguments
  const args = process.argv.slice(2)
  let count = DEFAULT_COUNT

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--count" && args[i + 1]) {
      count = parseInt(args[i + 1]!, 10)
      if (isNaN(count) || count < 1) {
        console.error("❌ Invalid count value")
        process.exit(1)
      }
    }
  }

  // Environment check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("❌ Missing environment variables:")
    console.error("   NEXT_PUBLIC_SUPABASE_URL")
    console.error("   SUPABASE_SERVICE_ROLE_KEY")
    console.error("")
    console.error("Make sure .env.local file exists with these variables.")
    process.exit(1)
  }

  console.log("🌱 Test Data Generator")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`📊 Count: ${count} records`)
  console.log(`🔗 Supabase URL: ${supabaseUrl}`)
  console.log("")
  console.log("⚠️  This will insert test data into your database.")
  console.log("")

  // Confirm
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const answer = await new Promise<string>((resolve) => {
    rl.question("Continue? (yes/no): ", resolve)
  })
  rl.close()

  if (answer.toLowerCase() !== "yes") {
    console.log("❌ Aborted")
    process.exit(0)
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  // Generate and insert data
  console.log("")
  console.log("📝 Generating test data...")

  const records = Array.from({ length: count }, () => generateSurveyResponse())

  console.log(`✅ Generated ${count} records`)
  console.log("")
  console.log("💾 Inserting into Supabase...")

  let inserted = 0

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE)

    const { error } = await supabase.from("survey_responses").insert(batch)

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error)
      process.exit(1)
    }

    inserted += batch.length
    const progress = Math.round((inserted / count) * 100)
    process.stdout.write(`\r   Progress: ${inserted}/${count} (${progress}%)`)
  }

  console.log("")
  console.log("")
  console.log(`✅ Successfully inserted ${count} test records!`)
  console.log("")
  console.log("🎉 Done!")
}

main().catch((err) => {
  console.error("❌ Fatal error:", err)
  process.exit(1)
})
