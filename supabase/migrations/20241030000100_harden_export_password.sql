-- 제거: 저장소에 노출된 기본 내보내기 비밀번호 초기값을 삭제하고 초기 설정 로직을 강화합니다.

-- 기본값으로 커밋된 내보내기 비밀번호 제거 (기존 마이그레이션에서 생성된 항목)
DELETE FROM export_passwords
WHERE password_hash = encode(extensions.digest('export2025!@#'::bytea, 'sha256'::text), 'hex');

-- 내보내기 비밀번호가 없는 경우를 안전하게 처리하도록 검증 함수 재정의
CREATE OR REPLACE FUNCTION verify_export_password(input_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
  input_hash TEXT;
BEGIN
  SELECT password_hash
    INTO stored_hash
  FROM export_passwords
  ORDER BY updated_at DESC
  LIMIT 1;

  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;

  input_hash := encode(extensions.digest(convert_to(input_password, 'UTF8'), 'sha256'::text), 'hex');

  RETURN stored_hash = input_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 초기 설정 및 이후 변경 모두 안전하게 처리하도록 업데이트 함수 재정의
CREATE OR REPLACE FUNCTION update_export_password(
  old_password TEXT,
  new_password TEXT,
  user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  current_hash TEXT;
BEGIN
  IF new_password IS NULL OR length(trim(new_password)) < 8 THEN
    RAISE EXCEPTION 'New password must be at least 8 characters.';
  END IF;

  SELECT password_hash
    INTO current_hash
  FROM export_passwords
  ORDER BY updated_at DESC
  LIMIT 1;

  IF current_hash IS NULL THEN
    INSERT INTO export_passwords (password_hash, updated_by)
    VALUES (
      encode(extensions.digest(convert_to(new_password, 'UTF8'), 'sha256'::text), 'hex'),
      user_id
    );
    RETURN TRUE;
  END IF;

  IF NOT verify_export_password(old_password) THEN
    RETURN FALSE;
  END IF;

  INSERT INTO export_passwords (password_hash, updated_by)
  VALUES (
    encode(extensions.digest(convert_to(new_password, 'UTF8'), 'sha256'::text), 'hex'),
    user_id
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

