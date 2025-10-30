-- Remove reward-related fields from survey_responses table
-- These fields are no longer needed as the reward system has been removed

-- Drop index first
drop index if exists public.survey_responses_reward_status_idx;

-- Remove reward columns
alter table public.survey_responses
  drop column if exists reward_status,
  drop column if exists reward_sent_at,
  drop column if exists reward_note;
