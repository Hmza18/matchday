-- Fix recursive/unqualified league RLS, add join/create RPCs,
-- allow fellow members to read picks, and enable chat realtime.

create schema if not exists private;

create or replace function private.is_league_member(p_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.league_members
    where league_id = p_league_id
      and user_id = auth.uid()
  );
$$;

create or replace function private.shares_league_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.league_members me
    join public.league_members them
      on them.league_id = me.league_id
    where me.user_id = auth.uid()
      and them.user_id = p_user_id
  );
$$;

revoke all on function private.is_league_member(uuid) from public;
revoke all on function private.shares_league_with(uuid) from public;
grant execute on function private.is_league_member(uuid) to authenticated;
grant execute on function private.shares_league_with(uuid) to authenticated;

drop policy if exists "Members can read membership" on public.league_members;
drop policy if exists "Members can read messages" on public.league_messages;
drop policy if exists "Members can post messages" on public.league_messages;
drop policy if exists "Members can read leagues" on public.leagues;

create policy "Members can read membership"
  on public.league_members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or private.is_league_member(league_id)
  );

create policy "Members can read leagues"
  on public.leagues
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or private.is_league_member(id)
  );

create policy "Members can read messages"
  on public.league_messages
  for select
  to authenticated
  using (private.is_league_member(league_id));

create policy "Members can post messages"
  on public.league_messages
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and private.is_league_member(league_id)
  );

drop policy if exists "League members can read fellow picks" on public.picks;

create policy "League members can read fellow picks"
  on public.picks
  for select
  to authenticated
  using (private.shares_league_with(user_id));

create or replace function private.new_invite_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i int;
begin
  loop
    candidate := '';
    for i in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (
      select 1 from public.leagues where invite_code = candidate
    );
  end loop;
  return candidate;
end;
$$;

create or replace function private.create_league(p_name text)
returns public.leagues
language plpgsql
security definer
set search_path = public
as $$
declare
  trimmed text := trim(p_name);
  created public.leagues;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if char_length(trimmed) < 2 then
    raise exception 'League name must be at least 2 characters';
  end if;

  insert into public.leagues (name, invite_code, owner_id)
  values (trimmed, private.new_invite_code(), auth.uid())
  returning * into created;

  insert into public.league_members (league_id, user_id)
  values (created.id, auth.uid());

  return created;
end;
$$;

create or replace function private.join_league(p_code text)
returns public.leagues
language plpgsql
security definer
set search_path = public
as $$
declare
  code text := upper(trim(p_code));
  found public.leagues;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if char_length(code) < 4 then
    raise exception 'Enter a valid invite code';
  end if;

  select * into found
  from public.leagues
  where invite_code = code;

  if found.id is null then
    raise exception 'No league found for that code';
  end if;

  insert into public.league_members (league_id, user_id)
  values (found.id, auth.uid())
  on conflict (league_id, user_id) do nothing;

  return found;
end;
$$;

create or replace function public.create_league(p_name text)
returns public.leagues
language sql
security invoker
set search_path = private, public
as $$
  select * from private.create_league(p_name);
$$;

create or replace function public.join_league(p_code text)
returns public.leagues
language sql
security invoker
set search_path = private, public
as $$
  select * from private.join_league(p_code);
$$;

revoke all on function public.create_league(text) from public, anon;
revoke all on function public.join_league(text) from public, anon;
grant execute on function public.create_league(text) to authenticated;
grant execute on function public.join_league(text) to authenticated;

grant usage on schema private to authenticated;
grant execute on function private.create_league(text) to authenticated;
grant execute on function private.join_league(text) to authenticated;
grant execute on function private.new_invite_code() to authenticated;

alter table public.league_messages replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'league_messages'
  ) then
    execute 'alter publication supabase_realtime add table public.league_messages';
  end if;
end;
$$;
