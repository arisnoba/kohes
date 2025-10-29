# Supabase 설정

Supabase 데이터베이스 마이그레이션 및 설정을 관리합니다.

## 마이그레이션 실행

```bash
pnpm supabase db push
```

## 로컬 개발

```bash
# Supabase 로컬 인스턴스 시작
pnpm supabase:start

# Supabase 로컬 인스턴스 중지
pnpm supabase:stop
```

## 데이터베이스 스키마

설문 응답 데이터를 저장하기 위한 테이블 구조:

- `survey_responses`: 설문 응답 데이터 (PII 분리)
- RLS 정책 적용 필요

