#!/usr/bin/env tsx
/**
 * Supabase 연결 확인 스크립트
 * 환경변수가 올바르게 설정되었는지, 데이터베이스 연결이 가능한지 확인합니다.
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

// .env.local 파일 로드
config({ path: resolve(process.cwd(), ".env.local") })

const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
}

function log(color: keyof typeof COLORS, message: string) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`)
}

async function checkSupabaseConnection() {
  console.log("\n" + "=".repeat(50))
  log("blue", "🔍 Supabase 연결 확인 시작...")
  console.log("=".repeat(50) + "\n")

  // 1. 환경변수 확인
  log("blue", "📋 1단계: 환경변수 확인")
  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]

  let hasError = false

  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (!value || value.includes("your_supabase")) {
      log("red", `   ❌ ${varName}: 설정되지 않았거나 기본값입니다`)
      hasError = true
    } else {
      log("green", `   ✅ ${varName}: 설정됨`)
    }
  }

  if (hasError) {
    console.log()
    log("yellow", "⚠️  환경변수를 설정해주세요:")
    console.log("   1. .env.local 파일을 엽니다")
    console.log("   2. https://app.supabase.com 에서 프로젝트 설정 > API로 이동")
    console.log("   3. URL과 API 키를 복사해서 붙여넣습니다")
    console.log()
    process.exit(1)
  }

  // 2. URL 형식 확인
  console.log()
  log("blue", "🌐 2단계: URL 형식 확인")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const urlPattern = /^https?:\/\/[a-zA-Z0-9-]+\.supabase\.co$/
  const isLocalhost = url.includes("localhost")

  if (!urlPattern.test(url) && !isLocalhost) {
    log("yellow", `   ⚠️  URL 형식이 올바르지 않을 수 있습니다: ${url}`)
    log("yellow", "   예상 형식: https://your-project-id.supabase.co")
  } else {
    log("green", `   ✅ URL 형식이 올바릅니다: ${url}`)
  }

  // 3. 데이터베이스 연결 테스트
  console.log()
  log("blue", "🔌 3단계: 데이터베이스 연결 테스트")

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 간단한 쿼리 실행
    const { data, error } = await supabase
      .from("survey_responses")
      .select("count", { count: "exact", head: true })

    if (error) {
      if (error.code === "PGRST116") {
        log("yellow", "   ⚠️  survey_responses 테이블이 없습니다")
        log("yellow", "   마이그레이션을 실행해주세요: pnpm supabase:db:push")
      } else {
        log("red", `   ❌ 데이터베이스 오류: ${error.message}`)
        throw error
      }
    } else {
      log("green", "   ✅ 데이터베이스 연결 성공!")
    }

    // 4. 테이블 존재 여부 확인
    console.log()
    log("blue", "📊 4단계: 테이블 확인")

    // 직접 테이블 쿼리로 존재 여부 확인
    const { data: tableData, error: tableCheckError } = await supabase
      .from("survey_responses")
      .select("id")
      .limit(1)

    if (tableCheckError) {
      if (
        tableCheckError.code === "PGRST116" ||
        tableCheckError.message?.includes("does not exist")
      ) {
        log("yellow", "   ⚠️  survey_responses 테이블이 생성되지 않았습니다")
        log("yellow", "   다음 명령어로 마이그레이션을 실행하세요:")
        console.log()
        console.log("   pnpm supabase:db:push")
        console.log()
      } else {
        log("yellow", `   ⚠️  테이블 확인 중 오류: ${tableCheckError.message}`)
      }
    } else {
      log("green", "   ✅ survey_responses 테이블이 존재합니다")
    }
  } catch (error: any) {
    console.log()
    log("red", `   ❌ 연결 실패: ${error.message}`)
    console.log()
    log("yellow", "💡 해결 방법:")
    console.log("   1. Supabase 프로젝트가 활성 상태인지 확인하세요")
    console.log("   2. API 키가 올바른지 확인하세요")
    console.log("   3. https://app.supabase.com 에서 프로젝트 상태를 확인하세요")
    console.log()
    process.exit(1)
  }

  // 완료
  console.log()
  console.log("=".repeat(50))
  log("green", "🎉 Supabase 연결이 정상적으로 설정되었습니다!")
  console.log("=".repeat(50))
  console.log()
}

// 실행
checkSupabaseConnection().catch((error) => {
  console.error(error)
  process.exit(1)
})
