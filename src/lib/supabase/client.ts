import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"
import { checkSupabaseEnv, checkSupabaseServerEnv } from "./env-check"

// 개발 모드에서 환경변수 체크
if (process.env.NODE_ENV === "development") {
  checkSupabaseEnv()
}

export function createSupabaseClient() {
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
