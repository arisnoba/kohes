-- 함수 보안 강화: search_path 설정으로 schema injection 공격 방지

-- set_updated_at 함수 재정의 (search_path 추가)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- verify_export_password 함수 재정의 (search_path 추가)
CREATE OR REPLACE FUNCTION verify_export_password(input_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
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
$$;

-- update_export_password 함수 재정의 (search_path 추가)
CREATE OR REPLACE FUNCTION update_export_password(
  old_password TEXT,
  new_password TEXT,
  user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
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
$$;

-- log_export 함수 재정의 (search_path 추가)
CREATE OR REPLACE FUNCTION log_export(
  p_user_id UUID,
  p_export_type TEXT,
  p_export_format TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO export_logs (user_id, export_type, export_format, ip_address, user_agent)
  VALUES (p_user_id, p_export_type, p_export_format, p_ip_address, p_user_agent)
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;
