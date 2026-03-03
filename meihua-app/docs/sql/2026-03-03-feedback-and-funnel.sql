-- P0: feedback table migration
create table if not exists public.feedback (
  id bigserial primary key,
  sentiment text not null default 'neutral',
  rating integer,
  message text,
  source text not null default 'web',
  created_at timestamptz not null default now(),
  check (rating is null or (rating >= 1 and rating <= 5))
);

create index if not exists idx_feedback_created_at on public.feedback (created_at desc);
create index if not exists idx_feedback_sentiment on public.feedback (sentiment);

-- P1: funnel events table
create table if not exists public.funnel_events (
  id bigserial primary key,
  event text not null,
  session_id text,
  page text,
  source text,
  lang text,
  ip text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (event in ('session_start','reading_done','checkout_open','paid_success'))
);

create index if not exists idx_funnel_event_created_at on public.funnel_events (event, created_at desc);
create index if not exists idx_funnel_session_created_at on public.funnel_events (session_id, created_at desc);
create index if not exists idx_funnel_source_created_at on public.funnel_events (source, created_at desc);

-- Health query example:
-- select event, count(*) from public.funnel_events where created_at >= now() - interval '24 hours' group by 1;
