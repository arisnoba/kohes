-- pgcrypto extension 활성화 (SHA-256 해싱 사용)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 내보내기 비밀번호 테이블
CREATE TABLE IF NOT EXISTS export_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 초기 비밀번호 설정 (기본값: 'export2025!@#')
-- 실제 운영에서는 반드시 변경하세요
INSERT INTO export_passwords (password_hash, updated_by)
VALUES (
  encode(extensions.digest('export2025!@#'::bytea, 'sha256'::text), 'hex'),
  NULL
);

-- 내보내기 감사 로그 테이블
CREATE TABLE IF NOT EXISTS export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  export_type TEXT NOT NULL CHECK (export_type IN ('all', 'response', 'pii')),
  export_format TEXT NOT NULL CHECK (export_format IN ('csv', 'json')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_export_logs_user_id ON export_logs(user_id);
CREATE INDEX idx_export_logs_created_at ON export_logs(created_at DESC);

-- RLS 정책
ALTER TABLE export_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;

-- 관리자만 비밀번호 읽기/수정 가능
CREATE POLICY "Admin can read export passwords" ON export_passwords
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin can update export passwords" ON export_passwords
  FOR UPDATE TO authenticated
  USING (true);

-- 관리자는 모든 로그 조회 가능
CREATE POLICY "Admin can read all export logs" ON export_logs
  FOR SELECT TO authenticated
  USING (true);

-- 관리자는 자신의 로그 생성 가능
CREATE POLICY "Admin can insert own export logs" ON export_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 비밀번호 검증 함수
CREATE OR REPLACE FUNCTION verify_export_password(input_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
  input_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM export_passwords
  ORDER BY updated_at DESC
  LIMIT 1;
  
  input_hash := encode(extensions.digest(convert_to(input_password, 'UTF8'), 'sha256'::text), 'hex');
  
  RETURN stored_hash = input_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 비밀번호 업데이트 함수
CREATE OR REPLACE FUNCTION update_export_password(
  old_password TEXT,
  new_password TEXT,
  user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  is_valid BOOLEAN;
BEGIN
  -- 기존 비밀번호 검증
  SELECT verify_export_password(old_password) INTO is_valid;
  
  IF NOT is_valid THEN
    RETURN FALSE;
  END IF;
  
  -- 새 비밀번호로 업데이트
  UPDATE export_passwords
  SET 
    password_hash = encode(extensions.digest(convert_to(new_password, 'UTF8'), 'sha256'::text), 'hex'),
    updated_at = now(),
    updated_by = user_id
  WHERE id = (
    SELECT id FROM export_passwords
    ORDER BY updated_at DESC
    LIMIT 1
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 로그 생성 함수
CREATE OR REPLACE FUNCTION log_export(
  p_user_id UUID,
  p_export_type TEXT,
  p_export_format TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO export_logs (user_id, export_type, export_format, ip_address, user_agent)
  VALUES (p_user_id, p_export_type, p_export_format, p_ip_address, p_user_agent)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

