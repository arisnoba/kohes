# Supabase 설정

Supabase 데이터베이스 마이그레이션 및 설정을 관리합니다.

## 환경변수 설정

1. `.env.example` 파일을 참고하여 `.env.local` 파일을 생성합니다
2. Supabase 프로젝트 대시보드에서 API 키를 확인합니다
   - 대시보드 URL: https://app.supabase.com/project/_/settings/api
3. 다음 환경변수를 설정합니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **주의**: `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용하며, 절대 클라이언트에 노출하지 마세요.

## 마이그레이션 실행

```bash
pnpm supabase db push
```

## 로컬 개발

로컬에서 Supabase를 실행하려면:

```bash
# Supabase 로컬 인스턴스 시작
pnpm supabase:start

# 실행 후 터미널에 표시되는 로컬 환경변수를 .env.local에 설정
# API URL: http://localhost:54321
# anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (터미널에 표시됨)
# service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (터미널에 표시됨)

# Supabase 로컬 인스턴스 중지
pnpm supabase:stop
```

로컬 개발 시 `.env.local`을 다음과 같이 설정하세요:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<로컬_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<로컬_service_role_key>
```

## 데이터베이스 스키마

설문 응답 데이터를 저장하기 위한 테이블 구조:

- `survey_responses`: 설문 응답 데이터 (PII 분리)
- RLS 정책 적용 필요
