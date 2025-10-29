# 의료해외진출 현황조사 프로젝트

2025년 의료해외진출 현황조사를 위한 Next.js 기반 설문 시스템입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **Language**: TypeScript
- **Form Management**: React Hook Form + Zod

## 프로젝트 구조

```
.
├── app/
│   ├── (survey)/          # 설문 관련 라우트
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (admin)/           # 관리자 관련 라우트
│   │   ├── login/         # 관리자 로그인
│   │   ├── dashboard/     # 관리자 대시보드
│   │   └── exports/       # 데이터 내보내기
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── src/
│   ├── lib/
│   │   ├── supabase/      # Supabase 클라이언트
│   │   ├── validation/    # 검증 로직
│   │   └── survey/        # 설문 스키마 로더
├── supabase/             # Supabase 마이그레이션 및 설정
├── survey_schema.json    # 설문 스키마 정의
└── PRD.md               # 제품 요구사항 문서
```

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일이 이미 생성되어 있습니다. 다음 단계를 따라 설정하세요:

1. [Supabase 대시보드](https://app.supabase.com)에 로그인
2. 프로젝트 선택 → Settings → API 메뉴로 이동
3. `.env.local` 파일에 다음 값을 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

⚠️ **보안 주의사항**:

- `NEXT_PUBLIC_*` 접두사가 있는 변수는 클라이언트에 노출됩니다
- `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용하며 절대 클라이언트에 노출하지 마세요
- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 추적되지 않습니다

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 주요 명령어

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 검사
pnpm lint

# 코드 포맷팅
pnpm format

# 테스트 실행
pnpm test

# Supabase 시작
pnpm supabase:start

# Supabase 마이그레이션 적용
pnpm supabase:db:push
```

## 기능

### 설문 기능

- 조건부 질문 분기
- 다양한 입력 타입 지원 (단일/다중 선택, 순위 선택, 텍스트, 텍스트 영역)
- 실시간 유효성 검사
- 모바일 우선 반응형 디자인

### 관리자 기능

- 관리자 로그인 (인증 필요)
- 설문 응답 현황 대시보드
- CSV/JSON 데이터 내보내기
- PII 데이터 분리 관리

## 보안

- 통계법 제33조·제34조 준수
- PII 데이터 분리 저장
- 파일 업로드 암호화 (AES-256)
- 최소 권한 원칙 적용

## 라이선스

MIT
