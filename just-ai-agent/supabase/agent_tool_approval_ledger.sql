create table if not exists public.agent_tool_requests (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  session_id uuid references public.agent_sessions(id) on delete cascade,
  tool_name text not null,
  risk text not null check (risk in ('read','write','consequential')),
  input jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','rejected','executing','executed','failed','expired')),
  output jsonb,
  error text,
  approval_note text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  executed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_agent_tool_requests_user_created
  on public.agent_tool_requests(user_id, created_at desc);
create index if not exists idx_agent_tool_requests_session
  on public.agent_tool_requests(session_id);
create index if not exists idx_agent_tool_requests_status
  on public.agent_tool_requests(status);

alter table public.agent_tool_requests enable row level security;
revoke all on table public.agent_tool_requests from anon, authenticated;
grant select, insert, update, delete on table public.agent_tool_requests to authenticated;

drop policy if exists "Users select own agent tool requests" on public.agent_tool_requests;
create policy "Users select own agent tool requests"
on public.agent_tool_requests for select to authenticated
using ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users insert own agent tool requests" on public.agent_tool_requests;
create policy "Users insert own agent tool requests"
on public.agent_tool_requests for insert to authenticated
with check ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users update own agent tool requests" on public.agent_tool_requests;
create policy "Users update own agent tool requests"
on public.agent_tool_requests for update to authenticated
using ((select auth.jwt()->>'sub') = user_id)
with check ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "Users delete own agent tool requests" on public.agent_tool_requests;
create policy "Users delete own agent tool requests"
on public.agent_tool_requests for delete to authenticated
using ((select auth.jwt()->>'sub') = user_id);
