-- Fix RLS policies for survey_responses
-- 모든 기존 정책을 삭제하고 다시 생성

-- 모든 기존 정책 삭제
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON survey_responses;
DROP POLICY IF EXISTS "Enable insert for all users" ON survey_responses;
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON survey_responses;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON survey_responses;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON survey_responses;

-- RLS가 활성화되어 있는지 확인하고 필요시 활성화
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Policy: 인증된 사용자만 응답 조회 가능
CREATE POLICY "Enable read access for authenticated users only"
ON survey_responses
FOR SELECT
TO authenticated
USING (true);

-- Policy: 모든 사용자(익명 포함)가 응답 생성 가능 (설문 제출용)
CREATE POLICY "Enable insert for all users"
ON survey_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: 인증된 사용자만 응답 수정 가능
CREATE POLICY "Enable update for authenticated users only"
ON survey_responses
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: 인증된 사용자만 응답 삭제 가능
CREATE POLICY "Enable delete for authenticated users only"
ON survey_responses
FOR DELETE
TO authenticated
USING (true);






