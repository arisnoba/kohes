# Supabase 보안 설정 가이드

이 문서는 Supabase 보안 경고를 해결하기 위한 가이드입니다.

## 1. 함수 보안 강화 (✅ 완료)

### 문제
- `function_search_path_mutable` 경고
- 4개 함수에 `search_path` 설정 누락으로 인한 schema injection 공격 취약점

### 해결
- ✅ Migration 파일 생성: `20250104000000_fix_function_security.sql`
- 모든 함수에 `SET search_path` 추가:
  - `set_updated_at()`: `SET search_path = ''`
  - `verify_export_password()`: `SET search_path = public, extensions`
  - `update_export_password()`: `SET search_path = public, extensions`
  - `log_export()`: `SET search_path = public`

### 적용 방법
```bash
pnpm supabase db push
```

---

## 2. Auth 보안 설정 (⚠️ Dashboard 설정 필요)

### 2.1 Leaked Password Protection (유출된 비밀번호 보호)

**문제**: 유출된 비밀번호 사용 방지 기능 비활성화

**해결 방법**:
1. Supabase Dashboard → Authentication → Policies
2. "Password Strength" 섹션으로 이동
3. "Enable leaked password protection" 체크박스 활성화
4. 저장

**효과**:
- HaveIBeenPwned.org 데이터베이스와 연동
- 유출된 비밀번호 사용 시 자동 차단
- 사용자 계정 보안 강화

---

### 2.2 Multi-Factor Authentication Options (다단계 인증)

**문제**: MFA 옵션 부족

**해결 방법**:
1. Supabase Dashboard → Authentication → MFA
2. 다음 MFA 옵션 중 하나 이상 활성화:
   - ✅ **TOTP (Time-based One-Time Password)** - 권장
     - Google Authenticator, Authy 등 호환
   - ✅ **Phone (SMS)**
     - SMS 인증 코드 발송
     - Twilio 등 SMS 제공자 설정 필요
   - ✅ **Email**
     - 이메일 인증 코드 발송
     - 기본 제공, 추가 설정 불필요

**권장 설정**:
- **최소**: TOTP + Email (무료, 즉시 사용 가능)
- **권장**: TOTP + Email + Phone (SMS 제공자 필요)

**활성화 순서**:
1. Email MFA 활성화 (기본 제공)
2. TOTP 활성화 (가장 안전하고 사용자 친화적)
3. (선택) Phone/SMS 활성화 (SMS 제공자 계정 필요)

---

## 3. 검증

### Database Linter 재실행

⚠️ **중요**: `supabase db lint` CLI 명령어는 로컬 DB만 검사합니다.

**원격 DB 확인 방법**:
1. Supabase Dashboard 접속 (https://supabase.com/dashboard)
2. 프로젝트 선택
3. 좌측 메뉴: **Database** → **Advisors**
4. 페이지 새로고침 (자동으로 재검사됨)

**또는 SQL Editor에서 직접 확인**:
```sql
-- 함수의 search_path 설정 확인
SELECT
  p.proname as function_name,
  CASE
    WHEN p.proconfig IS NOT NULL THEN
      array_to_string(p.proconfig, ', ')
    ELSE 'No config set'
  END as search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('set_updated_at', 'verify_export_password',
                     'update_export_password', 'log_export')
ORDER BY p.proname;
```

### 예상 결과
- ✅ `function_search_path_mutable` 경고 제거 (4개 함수)
- ✅ `auth_leaked_password_protection` 경고 제거 (설정 완료 시)
- ✅ `auth_insufficient_mfa_options` 경고 제거 (2개 이상 활성화 시)

---

## 4. 보안 권장 사항

### 비밀번호 정책
- [x] Leaked password protection 활성화
- [x] 최소 8자 이상 (이미 적용됨)
- [ ] 복잡도 요구사항 설정 권장
  - 대소문자, 숫자, 특수문자 조합

### MFA 정책
- [x] 2개 이상 MFA 옵션 활성화
- [ ] 관리자 계정 MFA 필수 설정 권장
- [ ] 민감한 작업(데이터 내보내기 등) 시 MFA 재인증 고려

### 모니터링
- [ ] Export logs 정기 확인
- [ ] 비정상적인 로그인 시도 모니터링
- [ ] 비밀번호 변경 로그 추적

---

## 참고 문서

- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [Password Security](https://supabase.com/docs/guides/auth/password-security)
- [Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa)
- [Function Security](https://supabase.com/docs/guides/database/functions#security-definer-vs-invoker)
