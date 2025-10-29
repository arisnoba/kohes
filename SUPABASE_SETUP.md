# Supabase 설정 가이드

## 1단계: Supabase 프로젝트 생성

1. [https://app.supabase.com](https://app.supabase.com)에 접속하여 로그인
2. "New Project" 버튼 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전(서울: ap-northeast-2) 선택
4. "Create new project" 클릭 (프로젝트 생성까지 1-2분 소요)

## 2단계: API 키 복사

프로젝트가 생성되면:

1. 좌측 메뉴에서 **Settings** (⚙️) 클릭
2. **API** 메뉴 클릭
3. 다음 정보를 복사:
   - **Project URL** (예: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** 키 (public 키)
   - **service_role** 키 (secret 키, 절대 노출 금지!)

## 3단계: 환경변수 설정

프로젝트 루트의 `.env.local` 파일을 열고 복사한 값을 붙여넣습니다:

```bash
# .env.local 파일

# 1. Project URL을 여기에 붙여넣기
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# 2. anon public 키를 여기에 붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. service_role 키를 여기에 붙여넣기
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **중요**:

- `your-project-id`, `your_supabase_anon_key`, `your_supabase_service_role_key`를 **실제 값으로 교체**해야 합니다
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 코드에 노출하지 마세요

## 4단계: 데이터베이스 마이그레이션

터미널에서 다음 명령어를 실행하여 데이터베이스 테이블을 생성합니다:

```bash
# Supabase 프로젝트와 로컬 연결
supabase link --project-ref your-project-id

# 마이그레이션 실행
pnpm supabase:db:push
```

또는 Supabase 대시보드에서 직접 실행:

1. 좌측 메뉴에서 **SQL Editor** 클릭
2. "New query" 클릭
3. `supabase/migrations/20240127000000_create_survey_responses.sql` 파일 내용 복사 & 붙여넣기
4. "Run" 버튼 클릭

## 5단계: 연결 확인

환경변수 설정이 완료되면 다음 명령어로 연결을 확인합니다:

```bash
pnpm supabase:check
```

성공 시 다음과 같은 메시지가 표시됩니다:

```
==================================================
🔍 Supabase 연결 확인 시작...
==================================================

📋 1단계: 환경변수 확인
   ✅ NEXT_PUBLIC_SUPABASE_URL: 설정됨
   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: 설정됨
   ✅ SUPABASE_SERVICE_ROLE_KEY: 설정됨

🌐 2단계: URL 형식 확인
   ✅ URL 형식이 올바릅니다: https://...

🔌 3단계: 데이터베이스 연결 테스트
   ✅ 데이터베이스 연결 성공!

📊 4단계: 테이블 확인
   ✅ survey_responses 테이블이 존재합니다

==================================================
🎉 Supabase 연결이 정상적으로 설정되었습니다!
==================================================
```

## 6단계: 개발 서버 실행

모든 설정이 완료되면 개발 서버를 실행합니다:

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 트러블슈팅

### 문제: "환경변수가 설정되지 않았습니다" 오류

**해결방법**:

- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 환경변수 값에 따옴표가 없는지 확인
- 개발 서버를 재시작 (`Ctrl+C` 후 `pnpm dev`)

### 문제: "survey_responses 테이블이 없습니다" 경고

**해결방법**:

```bash
pnpm supabase:db:push
```

또는 Supabase 대시보드의 SQL Editor에서 마이그레이션 파일 실행

### 문제: "데이터베이스 연결 실패" 오류

**해결방법**:

1. Supabase 대시보드에서 프로젝트가 활성 상태인지 확인
2. API 키가 올바르게 복사되었는지 확인 (앞뒤 공백 없이)
3. 프로젝트가 일시 중지되었다면 재개

## 도움말

더 자세한 정보는 다음 문서를 참고하세요:

- [Supabase 공식 문서](https://supabase.com/docs)
- [프로젝트 README.md](./README.md)
- [Supabase CLI 가이드](https://supabase.com/docs/guides/cli)
