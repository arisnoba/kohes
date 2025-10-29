import { createSupabaseClient } from "./client"

export interface AuthUser {
  id: string
  email: string
  role?: string
}

/**
 * 이메일과 비밀번호로 로그인
 */
export async function signInWithPassword(email: string, password: string) {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * 로그아웃
 */
export async function signOut() {
  const supabase = createSupabaseClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * 현재 세션 가져오기
 */
export async function getSession() {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return data.session
}

/**
 * 현재 사용자 가져오기
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return {
    id: data.user.id,
    email: data.user.email || "",
    role: data.user.user_metadata?.role,
  }
}

/**
 * 인증 상태 변화 구독
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const supabase = createSupabaseClient()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || "",
        role: session.user.user_metadata?.role,
      })
    } else {
      callback(null)
    }
  })

  return subscription
}
