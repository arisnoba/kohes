create extension if not exists "uuid-ossp";

create table if not exists public.survey_responses (
  id uuid primary key default uuid_generate_v4(),
  submitted_at timestamptz not null default timezone('utc', now()),
  respondent_name text,
  organization_name text,
  reward_status text not null default '발송 대기',
  reward_sent_at timestamptz,
  reward_note text,
  response_data jsonb not null,
  pii_data jsonb,
  is_completed boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists survey_responses_reward_status_idx on public.survey_responses (reward_status);
create index if not exists survey_responses_submitted_at_idx on public.survey_responses (submitted_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger survey_responses_set_updated_at
before update on public.survey_responses
for each row
execute function public.set_updated_at();
