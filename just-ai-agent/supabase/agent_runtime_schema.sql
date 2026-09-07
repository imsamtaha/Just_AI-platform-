create extension if not exists pgcrypto;

-- Clerk is the application identity provider. Clerk user IDs are text values,
-- so ownership is stored as text and checked against the authenticated JWT sub.
create table if not exists public.agent_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text,
  status text not null default 'active' check (status in ('active','archived','closed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_executions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.agent_sessions(id) on delete cascade,
  user_id text not null,
  input text not null,
  output text,
  selected_skills text[] not null default '{}'::text[],
  status text not null default 'completed' check (status in ('queued','running','completed','failed')),
  validation jsonb not null default '{}'::jsonb,
  model text,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.agent_skill_usage (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.agent_executions(id) on delete cascade,
  user_id text not null,
  skill_name text not null,
  skill_version text not null default '1.0.0',
  score numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_memories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  session_id uuid references public.agent_sessions(id) on delete cascade,
  memory_key text not null,
  content text not null,
  memory_type text not null default 'working' check (memory_type in ('working','preference','fact','summary')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, session_id, memory_key)
);

create index if not exists idx_agent_sessions_user_id on public.agent_sessions(user_id);
create index if not exists idx_agent_sessions_created_at on public.agent_sessions(created_at desc);
create index if not exists idx_agent_executions_user_id on public.agent_executions(user_id);
create index if not exists idx_agent_executions_session_id on public.agent_executions(session_id);
create index if not exists idx_agent_executions_created_at on public.agent_executions(created_at desc);
create index if not exists idx_agent_skill_usage_user_id on public.agent_skill_usage(user_id);
create index if not exists idx_agent_skill_usage_execution_id on public.agent_skill_usage(execution_id);
create index if not exists idx_agent_skill_usage_skill_name on public.agent_skill_usage(skill_name);
create index if not exists idx_agent_memories_user_id on public.agent_memories(user_id);
create index if not exists idx_agent_memories_session_id on public.agent_memories(session_id);

alter table public.agent_sessions enable row level security;
alter table public.agent_executions enable row level security;
alter table public.agent_skill_usage enable row level security;
alter table public.agent_memories enable row level security;

revoke all on table public.agent_sessions from anon, authenticated;
revoke all on table public.agent_executions from anon, authenticated;
revoke all on table public.agent_skill_usage from anon, authenticated;
revoke all on table public.agent_memories from anon, authenticated;

grant select, insert, update, delete on table public.agent_sessions to authenticated;
grant select, insert, delete on table public.agent_executions to authenticated;
grant select, insert, delete on table public.agent_skill_usage to authenticated;
grant select, insert, update, delete on table public.agent_memories to authenticated;

drop policy if exists "Users select own agent sessions" on public.agent_sessions;
create policy "Users select own agent sessions" on public.agent_sessions for select to authenticated using ((select auth.jwt()->>'sub') = user_id);
drop policy if exists "Users insert own agent sessions" on public.agent_sessions;
create policy "Users insert own agent sessions" on public.agent_sessions for insert to authenticated with check ((select auth.jwt()->>'sub') = user_id);
drop policy if exists "Users update own agent sessions" on public.agent_sessions;
create policy "Users update own agent sessions" on public.agent_sessions for update to authenticated using ((select auth.jwt()->>'sub') = user_id) with check ((select auth.jwt()->>'sub') = user_id);
drop policy if exists "Users delete own agent sessions" on public.agent_sessions;
create policy "Users delete own agent sessions" on public.agent_sessions for delete to authenticated using ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users select own agent executions" on public.agent_executions;
create policy "Users select own agent executions" on public.agent_executions for select to authenticated using ((select auth.jwt()->>'sub') = user_id);
drop policy if exists "Users insert own agent executions" on public.agent_executions;
create policy "Users insert own agent executions" on public.agent_executions for insert to authenticated with check ((select auth.jwt()->>'sub') = user_id and exists (select 1 from public.agent_sessions s where s.id = session_id and s.user_id = (select auth.jwt()->>'sub')));
drop policy if exists "Users delete own agent executions" on public.agent_executions;
create policy "Users delete own agent executions" on public.agent_executions for delete to authenticated using ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users select own agent skill usage" on public.agent_skill_usage;
create policy "Users select own agent skill usage" on public.agent_skill_usage for select to authenticated using ((select auth.jwt()->>'sub') = user_id);
drop policy if exists "Users insert own agent skill usage" on public.agent_skill_usage;
create policy "Users insert own agent skill usage" on public.agent_skill_usage for insert to authenticated with check ((select auth.jwt()->>'sub') = user_id and exists (select 1 from public.agent_executions e where e.id = execution_id and e.user_id = (select auth.jwt()->>'sub')));
drop policy if exists "Users delete own agent skill usage" on public.agent_skill_usage;
create policy "Users delete own agent skill usage" on public.agent_skill_usage for delete to authenticated using ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users select own agent memories" on public.agent_memories;
create policy "Users select own agent memories" on public.agent_memories for select to authenticated using ((select auth.jwt()->>'sub') = user_id);
drop policy if exists "Users insert own agent memories" on public.agent_memories;
create policy "Users insert own agent memories" on public.agent_memories for insert to authenticated with check ((select auth.jwt()->>'sub') = user_id and (session_id is null or exists (select 1 from public.agent_sessions s where s.id = session_id and s.user_id = (select auth.jwt()->>'sub'))));
drop policy if exists "Users update own agent memories" on public.agent_memories;
create policy "Users update own agent memories" on public.agent_memories for update to authenticated using ((select auth.jwt()->>'sub') = user_id) with check ((select auth.jwt()->>'sub') = user_id and (session_id is null or exists (select 1 from public.agent_sessions s where s.id = session_id and s.user_id = (select auth.jwt()->>'sub'))));
drop policy if exists "Users delete own agent memories" on public.agent_memories;
create policy "Users delete own agent memories" on public.agent_memories for delete to authenticated using ((select auth.jwt()->>'sub') = user_id);
