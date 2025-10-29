# 관리자 인증 설정 가이드

## 개요

이 문서는 Supabase Auth를 사용한 관리자 로그인 기능 설정 방법을 설명합니다.

## 구현된 기능

- ✅ 이메일/비밀번호 로그인
- ✅ 세션 관리
- ✅ 자동 로그아웃 (세션 만료 시)
- ✅ 로그인 페이지 리다이렉션
- ✅ Row Level Security (RLS) 정책
- ✅ 인증된 사용자만 데이터 조회 가능

## 1. RLS 정책 적용

마이그레이션을 적용하여 Row Level Security 정책을 활성화합니다:

```bash
# Supabase 로컬 인스턴스가 실행 중인지 확인
pnpm supabase:start

# 마이그레이션 적용
pnpm supabase db push
```

또는 원격 프로젝트에 직접 적용:

```bash
supabase db push --linked
```

## 2. 관리자 사용자 생성

### 2-1. Supabase Dashboard 사용

1. Supabase Dashboard 접속
2. Authentication > Users 메뉴로 이동
3. "Add user" 버튼 클릭
4. 이메일과 비밀번호 입력
5. "Auto Confirm User" 체크 (이메일 인증 생략)
6. 사용자 생성

### 2-2. SQL로 사용자 생성 (로컬 개발)

```sql
-- Supabase SQL Editor에서 실행

-- 1. 사용자 생성 (Supabase Auth)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  raw_user_meta_data
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@kohes.or.kr',
  crypt('your-password-here', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '{}'::jsonb
);

-- 2. 이메일 확인 완료 처리
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@kohes.or.kr';
```

## 3. 테스트

### 3-1. 로그인 테스트

1. 개발 서버 실행: `pnpm dev`
2. `/admin/login` 페이지 접속
3. 생성한 관리자 계정으로 로그인
4. 대시보드로 리다이렉션 확인

### 3-2. 인증 보호 확인

1. 로그아웃 상태에서 `/admin/dashboard` 접속 시도
2. 로그인 페이지로 자동 리다이렉션 확인
3. 로그인 후 대시보드 접근 가능 확인

### 3-3. 데이터 접근 권한 확인

```javascript
// 브라우저 개발자 도구 Console에서 테스트

// 로그아웃 상태에서 데이터 조회 (실패해야 함)
const { createClient } = await import("@supabase/supabase-js")
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data, error } = await supabase.from("survey_responses").select("*")

console.log("로그아웃 상태:", { data, error })
// 예상 결과: data = [], error = null (RLS로 인해 빈 배열)

// 로그인 후 동일한 쿼리 실행 (성공해야 함)
```

## 4. RLS 정책 설명

적용된 RLS 정책은 다음과 같습니다:

### 조회 (SELECT)

- **authenticated 사용자만** 응답 데이터 조회 가능
- 익명 사용자는 조회 불가

### 삽입 (INSERT)

- **모든 사용자** (익명 포함) 응답 제출 가능
- 설문 응답 제출을 위해 필요

### 수정 (UPDATE)

- **authenticated 사용자만** 응답 수정 가능
- 리워드 상태 변경 등에 사용

### 삭제 (DELETE)

- **authenticated 사용자만** 응답 삭제 가능

## 5. 주요 파일

### 인증 관련

- `src/lib/supabase/auth.ts` - 인증 헬퍼 함수
- `app/(admin)/admin/(auth)/login/page.tsx` - 로그인 페이지
- `src/components/admin/AdminShell.tsx` - 인증 체크 및 레이아웃

### 보안 정책

- `supabase/migrations/20240127000001_add_rls_policies.sql` - RLS 정책

## 6. 프로덕션 배포 시 주의사항

### 6-1. 환경변수 설정

`.env.local` 파일에 Supabase 환경변수가 올바르게 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 6-2. 보안 강화

프로덕션에서는 다음을 추가로 고려하세요:

1. **강력한 비밀번호 정책**
   - Supabase Dashboard > Authentication > Policies에서 설정
   - 최소 길이, 복잡도 요구사항 설정

2. **MFA (다중 인증) 활성화**
   - Supabase Auth에서 MFA 지원
   - 중요한 관리자 계정에 권장

3. **세션 타임아웃 설정**
   - Supabase Dashboard > Authentication > Settings
   - JWT expiry 시간 설정 (기본 1시간)

4. **IP 화이트리스트** (선택사항)
   - Supabase 네트워크 설정에서 관리자 IP만 허용

5. **감사 로그**
   - 관리자 활동 로깅 구현 고려
   - `auth.audit_log_entries` 테이블 활용

### 6-3. RLS 정책 점검

프로덕션 배포 전 RLS 정책이 올바르게 적용되었는지 확인:

```sql
-- RLS 활성화 여부 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'survey_responses';

-- 적용된 정책 확인
SELECT * FROM pg_policies
WHERE tablename = 'survey_responses';
```

## 7. 문제 해결

### "Invalid login credentials" 오류

- 이메일/비밀번호가 정확한지 확인
- Supabase Dashboard에서 사용자가 생성되었는지 확인
- 이메일이 확인(confirmed)되었는지 확인

### 로그인 후에도 데이터가 보이지 않음

- 브라우저 개발자 도구 > Network 탭에서 요청 확인
- RLS 정책이 올바르게 적용되었는지 확인
- 세션이 유효한지 확인 (개발자 도구 > Application > Cookies)

### 로그아웃이 작동하지 않음

- 브라우저 캐시 및 쿠키 삭제
- Supabase 세션 쿠키 확인

## 8. 추가 기능 구현 가이드

### 8-1. 비밀번호 재설정

향후 구현 시 참고:

```typescript
// src/lib/supabase/auth.ts에 추가
export async function resetPassword(email: string) {
  const supabase = createSupabaseClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  })

  if (error) throw new Error(error.message)
}
```

### 8-2. 역할 기반 접근 제어 (RBAC)

현재는 authenticated/anonymous만 구분하지만, 향후 역할 기반으로 확장 가능:

```sql
-- user_metadata에 역할 추가
UPDATE auth.users
SET raw_user_meta_data =
  raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@kohes.or.kr';

-- RLS 정책에 역할 조건 추가
CREATE POLICY "Only admin can delete"
ON survey_responses
FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
```

## 참고 자료

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase 인증](https://supabase.com/docs/guides/auth/server-side/nextjs)
