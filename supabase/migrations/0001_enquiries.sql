-- Enquiries from the /enquire form. Written only by the submit-enquiry edge function (service role).
-- RLS is on with no policies, so the public anon key can neither read nor write this table.
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320),
  company text not null default '' check (char_length(company) <= 200),
  timeline text not null default '' check (char_length(timeline) <= 200),
  message text not null check (char_length(message) between 1 and 5000)
);

create index if not exists enquiries_email_created_at on public.enquiries (email, created_at desc);

alter table public.enquiries enable row level security;
