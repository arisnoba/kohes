/**
 * 환경변수 설정 상태를 확인하는 유틸리티
 * 개발 모드에서만 작동하며 프로덕션에는 영향을 주지 않습니다
 */

export function checkSupabaseEnv() {
  // 프로덕션 환경에서는 체크하지 않음
  if (process.env.NODE_ENV === "production") {
    return true
  }

  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error("❌ Supabase 환경변수가 설정되지 않았습니다:")
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`)
    })
    console.error("\n📝 설정 방법:")
    console.error("   1. .env.local 파일을 열어주세요")
    console.error("   2. Supabase 대시보드 (https://app.supabase.com)에서 API 키를 복사하세요")
    console.error("   3. 자세한 내용은 README.md를 참고하세요\n")
    return false
  }

  // URL 형식 간단 체크
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith("http") && !supabaseUrl.includes("your-project-id")) {
    console.warn("⚠️  NEXT_PUBLIC_SUPABASE_URL이 올바른 형식이 아닐 수 있습니다")
    console.warn(`   현재 값: ${supabaseUrl}`)
    console.warn("   예상 형식: https://your-project-id.supabase.co 또는 http://localhost:54321\n")
    return false
  }

  // 기본값 체크
  if (supabaseUrl?.includes("your-project-id")) {
    console.warn("⚠️  환경변수가 기본값으로 설정되어 있습니다")
    console.warn("   .env.local 파일에서 실제 Supabase 프로젝트 값으로 변경해주세요\n")
    return false
  }

  console.log("✅ Supabase 환경변수가 올바르게 설정되었습니다")
  return true
}

// 서버 사이드에서 Service Role Key도 확인
export function checkSupabaseServerEnv() {
  if (process.env.NODE_ENV === "production") {
    return true
  }

  const serverEnvVar = "SUPABASE_SERVICE_ROLE_KEY"

  if (!process.env[serverEnvVar]) {
    console.error(`❌ ${serverEnvVar}가 설정되지 않았습니다`)
    console.error("   이 키는 서버 사이드 작업 (관리자 기능)에 필요합니다\n")
    return false
  }

  if (process.env[serverEnvVar]?.includes("your-service-role-key")) {
    console.warn(`⚠️  ${serverEnvVar}가 기본값으로 설정되어 있습니다`)
    console.warn("   .env.local 파일에서 실제 Supabase Service Role Key로 변경해주세요\n")
    return false
  }

  return true
}
