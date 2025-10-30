-- Enable Row Level Security on survey_responses
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (모든 가능한 정책 이름 삭제)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON survey_responses;
DROP POLICY IF EXISTS "Enable insert for all users" ON survey_responses;
DROP POLICY IF EXISTS "Enable read access for authenticated users only" ON survey_responses;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON survey_responses;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON survey_responses;

-- Policy: 인증된 사용자만 응답 조회 가능
CREATE POLICY "Enable read access for authenticated users only"
ON survey_responses
FOR SELECT
TO authenticated
USING (true);

-- Policy: 모든 사용자가 응답 생성 가능 (설문 제출용)
-- 실제 프로덕션에서는 더 엄격한 정책 필요
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

-- 인덱스 추가로 성능 최적화
-- Note: reward_status와 submitted_at 인덱스는 첫 번째 마이그레이션에서 이미 생성됨
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at 
ON survey_responses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_survey_responses_is_completed 
ON survey_responses(is_completed);

