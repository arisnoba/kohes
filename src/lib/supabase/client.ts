import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"
import { checkSupabaseEnv, checkSupabaseServerEnv } from "./env-check"

// 개발 모드에서 환경변수 체크
if (process.env.NODE_ENV === "development") {
  checkSupabaseEnv()
}

// 브라우저 환경에서 싱글톤 클라이언트 인스턴스
let browserClient: ReturnType<typeof createClient<Database>> | null = null

/**
 * 브라우저 환경에서 사용할 Supabase 클라이언트 생성 (싱글톤 패턴)
 * 동일한 브라우저 컨텍스트에서 하나의 인스턴스만 유지합니다.
 */
export function createSupabaseClient() {
  // 브라우저 환경인 경우 싱글톤 인스턴스 반환
  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }
    return browserClient
  }

  // 서버 환경에서는 매번 새 인스턴스 생성 (서버 컴포넌트는 요청마다 새로 생성되어야 함)
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// For server-side usage
export function createSupabaseServerClient() {
  // 서버 사이드에서 추가 환경변수 체크
  if (process.env.NODE_ENV === "development") {
    checkSupabaseServerEnv()
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
