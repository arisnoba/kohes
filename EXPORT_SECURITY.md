# 데이터 내보내기 보안 시스템

## 개요

하이브리드 보안 방식을 적용한 데이터 내보내기 시스템입니다.

- **웹 2차 인증**: 관리자 로그인 후 추가 비밀번호 입력
- **ZIP 암호화**: AES-256 암호화된 ZIP 파일 생성
- **감사 로그**: 모든 내보내기 이력 추적

## 보안 아키텍처

```
관리자 로그인 (Supabase Auth)
    ↓
데이터 내보내기 페이지
    ↓
내보내기 비밀번호 입력 (웹 2차 인증)
    ↓
비밀번호 검증 (Supabase Function)
    ↓
AES-256 암호화된 ZIP 생성
    ↓
감사 로그 기록
    ↓
다운로드
```

## 초기 설정

### 1. 데이터베이스 마이그레이션 실행

```bash
pnpm supabase db push
```

이 명령은 다음을 생성합니다:

- `export_passwords` 테이블: 내보내기 비밀번호 저장
- `export_logs` 테이블: 내보내기 이력 저장
- `verify_export_password()` 함수: 비밀번호 검증
- `update_export_password()` 함수: 비밀번호 변경
- `log_export()` 함수: 감사 로그 기록

### 2. 초기 비밀번호

**기본 비밀번호**: `export2025!@#`

⚠️ **중요**: 운영 환경에서는 반드시 변경하세요!

## 사용 방법

### 관리자용

#### 데이터 내보내기

1. `/admin/exports` 페이지 접속
2. 원하는 데이터 유형 선택 (전체/응답/PII)
3. 포맷 선택 (CSV/JSON)
4. 내보내기 비밀번호 입력
5. 암호화된 ZIP 파일 다운로드

#### 비밀번호 변경

1. `/admin/password` 페이지 접속
2. 현재 비밀번호 입력
3. 새 비밀번호 입력 (최소 8자)
4. 비밀번호 확인
5. 변경 완료

### 최종 사용자용

다운로드한 ZIP 파일을 압축 해제할 때:

1. ZIP 파일을 더블클릭하여 압축 해제 시도
2. 비밀번호 입력 프롬프트가 표시됨
3. 관리자로부터 별도로 전달받은 비밀번호 입력
4. 압축 해제 완료

## 보안 기능

### 1. 이중 인증

- **1차**: Supabase 인증 (관리자 로그인)
- **2차**: 내보내기 비밀번호 입력

### 2. AES-256 암호화

```typescript
const zipWriter = new ZipWriter(new BlobWriter("application/zip"), {
  password,
  encryptionStrength: 3,
  level: 9,
})

await zipWriter.add(fileName, new TextReader(fileContent), {
  password,
  encryptionStrength: 3,
})

const zipBlob = await zipWriter.close()
```

### 3. 감사 로그

모든 내보내기는 다음 정보와 함께 로그됩니다:

- 사용자 ID
- 내보내기 유형 (all/response/pii)
- 포맷 (csv/json)
- IP 주소
- User Agent
- 타임스탬프

### 4. 비밀번호 해싱

비밀번호는 SHA-256으로 해시되어 저장됩니다:

```sql
encode(extensions.digest('password'::bytea, 'sha256'::text), 'hex')
```

## 비밀번호 정책

### 권장 사항

- 최소 8자 이상
- 영문 대소문자, 숫자, 특수문자 조합
- 주기적 변경 (3개월마다)
- 타인과 공유 금지

### 변경 절차

1. 관리자가 `/admin/password`에서 비밀번호 변경
2. 새 비밀번호를 별도 채널(문자/전화)로 관련 담당자에게 전달
3. 이전 비밀번호는 즉시 무효화됨

## 감사 로그 조회

### SQL로 직접 조회

```sql
SELECT
  el.created_at,
  au.email,
  el.export_type,
  el.export_format,
  el.ip_address
FROM export_logs el
JOIN auth.users au ON el.user_id = au.id
ORDER BY el.created_at DESC;
```

### Supabase Dashboard

1. Supabase Dashboard 접속
2. Table Editor > export_logs 테이블 선택
3. 이력 확인

## 문제 해결

### 비밀번호를 잊어버렸어요

Supabase SQL Editor에서 수동으로 리셋:

```sql
UPDATE export_passwords
SET
  password_hash = encode(extensions.digest(convert_to('새비밀번호', 'UTF8'), 'sha256'::text), 'hex'),
  updated_at = now(),
  updated_by = NULL
WHERE id = (
  SELECT id FROM export_passwords
  ORDER BY updated_at DESC
  LIMIT 1
);
```

### ZIP 압축 해제가 안 돼요

- 올바른 비밀번호를 입력했는지 확인
- 최신 압축 프로그램 사용 (7-Zip, WinRAR, macOS 기본 압축 유틸리티)
- AES-256을 지원하는 프로그램인지 확인

### 내보내기가 실패해요

1. Supabase 연결 확인
2. 환경 변수 확인 (.env.local)
3. 브라우저 콘솔 에러 확인
4. Supabase 로그 확인

## 파일 구조

```
app/
├── (admin)/
│   └── admin/
│       └── (protected)/
│           ├── exports/
│           │   └── page.tsx          # 내보내기 페이지
│           └── password/
│               └── page.tsx          # 비밀번호 관리 페이지
└── api/
    └── admin/
        └── export/
            └── route.ts              # 내보내기 API

supabase/
└── migrations/
    └── 20240127000004_add_export_security.sql

src/
├── components/
│   ├── admin/
│   │   └── AdminShell.tsx           # 네비게이션
│   └── ui/
│       └── dialog.tsx               # 비밀번호 다이얼로그
└── lib/
    └── supabase/
        └── types.ts                 # TypeScript 타입
```

## 보안 체크리스트

- [ ] 초기 비밀번호 변경 완료
- [ ] 비밀번호 정책 수립 및 공유
- [ ] 관리자 계정 2FA 활성화 (Supabase)
- [ ] 정기적 감사 로그 검토 절차 수립
- [ ] ZIP 비밀번호 전달 채널 확보 (문자/전화)
- [ ] 다운로드한 파일 보관 정책 수립
- [ ] 정기적 비밀번호 변경 일정 수립

## 참고 자료

- [Archiver 문서](https://www.archiverjs.com/)
- [Supabase RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [AES-256 암호화](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
