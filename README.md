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

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

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

📘 **Supabase 상세 설정**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 참고

### 3. 데이터베이스 마이그레이션

```bash
# Supabase 로컬 인스턴스 시작
pnpm supabase:start

# 마이그레이션 적용
pnpm supabase:db:push
```

### 4. 관리자 계정 생성

관리자 페이지에 접근하려면 Supabase Auth 사용자를 생성해야 합니다:

📘 **인증 설정 가이드**: [AUTH_SETUP.md](./AUTH_SETUP.md) 참고

### 5. 개발 서버 실행

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

- ✅ 조건부 질문 분기
- ✅ 다양한 입력 타입 지원 (단일/다중 선택, 순위 선택, 텍스트, 텍스트 영역)
- ✅ 실시간 유효성 검사
- ✅ 모바일 우선 반응형 디자인
- ✅ 진행 상황 자동 저장

### 관리자 기능

- ✅ 관리자 로그인 (Supabase Auth)
- ✅ Row Level Security (RLS) 기반 데이터 보호
- ✅ 설문 응답 현황 대시보드
- ✅ 응답 데이터 조회 및 관리
- ✅ CSV/JSON 데이터 내보내기 (예정)
- ✅ PII 데이터 분리 저장

## 보안

- 통계법 제33조·제34조 준수
- PII 데이터 분리 저장
- Row Level Security (RLS) 기반 접근 제어
- 인증된 사용자만 데이터 조회 가능
- 파일 업로드 암호화 (AES-256)
- 최소 권한 원칙 적용

## 문서

- [CLOUDFLARE_D1_PREPARATION.md](./CLOUDFLARE_D1_PREPARATION.md) - 2026년 신규 설문을 위한 D1 전환 준비 절차 (구현 전 계획)
- [PRD.md](./PRD.md) - 제품 요구사항 문서
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase 설정 가이드
- [AUTH_SETUP.md](./AUTH_SETUP.md) - 관리자 인증 설정 가이드

## 라이선스

MIT

## 2026 D1 전환 작업

기존 `kohes` D1에 초기 스키마를 적용하고 테이블 4개와 인덱스 3개를 확인했습니다. 앱의 저장/조회 코드를 D1에 연결하고 서버 환경변수 기반 관리자 로그인으로 교체했습니다. 실제 연결과 운영 검증은 서버 자격 증명 설정 후 진행합니다. 원격 대상과 승인 상태, 로컬 명령은 [D1 작업 안내](d1/README.md)를 확인하세요.
