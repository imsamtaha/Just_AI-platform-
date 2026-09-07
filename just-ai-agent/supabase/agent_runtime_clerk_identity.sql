-- JUST AI Agent runtime: Clerk third-party auth ownership model
-- Applied to Supabase project `Just workspace`.
-- Clerk user IDs are text values (for example user_xxx), so agent ownership
-- is derived from the authenticated JWT `sub` claim rather than auth.users.

drop policy if exists "Users select own agent sessions" on public.agent_sessions;
drop policy if exists "Users insert own agent sessions" on public.agent_sessions;
drop policy if exists "Users update own agent sessions" on public.agent_sessions;
drop policy if exists "Users delete own agent sessions" on public.agent_sessions;
drop policy if exists "Users select own agent executions" on public.agent_executions;
drop policy if exists "Users insert own agent executions" on public.agent_executions;
drop policy if exists "Users delete own agent executions" on public.agent_executions;
drop policy if exists "Users select own agent skill usage" on public.agent_skill_usage;
drop policy if exists "Users insert own agent skill usage" on public.agent_skill_usage;
drop policy if exists "Users delete own agent skill usage" on public.agent_skill_usage;
drop policy if exists "Users select own agent memories" on public.agent_memories;
drop policy if exists "Users insert own agent memories" on public.agent_memories;
drop policy if exists "Users update own agent memories" on public.agent_memories;
drop policy if exists "Users delete own agent memories" on public.agent_memories;

alter table public.agent_sessions drop constraint if exists agent_sessions_user_id_fkey;
alter table public.agent_executions drop constraint if exists agent_executions_user_id_fkey;
alter table public.agent_skill_usage drop constraint if exists agent_skill_usage_user_id_fkey;
alter table public.agent_memories drop constraint if exists agent_memories_user_id_fkey;

alter table public.agent_sessions alter column user_id type text using user_id::text;
alter table public.agent_executions alter column user_id type text using user_id::text;
alter table public.agent_skill_usage alter column user_id type text using user_id::text;
alter table public.agent_memories alter column user_id type text using user_id::text;

create policy "Users select own agent sessions" on public.agent_sessions for select to authenticated using ((select auth.jwt()->>'sub') = user_id);
create policy "Users insert own agent sessions" on public.agent_sessions for insert to authenticated with check ((select auth.jwt()->>'sub') = user_id);
create policy "Users update own agent sessions" on public.agent_sessions for update to authenticated using ((select auth.jwt()->>'sub') = user_id) with check ((select auth.jwt()->>'sub') = user_id);
create policy "Users delete own agent sessions" on public.agent_sessions for delete to authenticated using ((select auth.jwt()->>'sub') = user_id);

create policy "Users select own agent executions" on public.agent_executions for select to authenticated using ((select auth.jwt()->>'sub') = user_id);
create policy "Users insert own agent executions" on public.agent_executions for insert to authenticated with check ((select auth.jwt()->>'sub') = user_id and exists (select 1 from public.agent_sessions s where s.id = session_id and s.user_id = (select auth.jwt()->>'sub')));
create policy "Users delete own agent executions" on public.agent_executions for delete to authenticated using ((select auth.jwt()->>'sub') = user_id);

create policy "Users select own agent skill usage" on public.agent_skill_usage for select to authenticated using ((select auth.jwt()->>'sub') = user_id);
create policy "Users insert own agent skill usage" on public.agent_skill_usage for insert to authenticated with check ((select auth.jwt()->>'sub') = user_id and exists (select 1 from public.agent_executions e where e.id = execution_id and e.user_id = (select auth.jwt()->>'sub')));
create policy "Users delete own agent skill usage" on public.agent_skill_usage for delete to authenticated using ((select auth.jwt()->>'sub') = user_id);

create policy "Users select own agent memories" on public.agent_memories for select to authenticated using ((select auth.jwt()->>'sub') = user_id);
create policy "Users insert own agent memories" on public.agent_memories for insert to authenticated with check ((select auth.jwt()->>'sub') = user_id and (session_id is null or exists (select 1 from public.agent_sessions s where s.id = session_id and s.user_id = (select auth.jwt()->>'sub'))));
create policy "Users update own agent memories" on public.agent_memories for update to authenticated using ((select auth.jwt()->>'sub') = user_id) with check ((select auth.jwt()->>'sub') = user_id and (session_id is null or exists (select 1 from public.agent_sessions s where s.id = session_id and s.user_id = (select auth.jwt()->>'sub'))));
create policy "Users delete own agent memories" on public.agent_memories for delete to authenticated using ((select auth.jwt()->>'sub') = user_id);
