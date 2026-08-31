-- Public global league, avatar column, storage, auto-join on signup.

alter table public.leagues
  add column if not exists is_public boolean not null default false;

create unique index if not exists leagues_one_public
  on public.leagues (is_public)
  where is_public;

alter table public.profiles
  add column if not exists avatar_url text;

drop policy if exists "Members can read leagues" on public.leagues;

create policy "Members can read leagues"
  on public.leagues
  for select
  to authenticated
  using (
    is_public
    or owner_id = auth.uid()
    or private.is_league_member(id)
  );

create or replace function private.ensure_global_league(p_owner uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  found uuid;
begin
  select id into found
  from public.leagues
  where is_public
  limit 1;

  if found is not null then
    return found;
  end if;

  insert into public.leagues (name, invite_code, owner_id, is_public)
  values ('Matchday Global', 'GLOBAL', p_owner, true)
  returning id into found;

  return found;
end;
$$;

revoke all on function private.ensure_global_league(uuid) from public;
grant execute on function private.ensure_global_league(uuid) to authenticated;

create or replace function public.join_global_league()
returns public.leagues
language plpgsql
security definer
set search_path = public
as $$
declare
  gid uuid;
  found public.leagues;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  gid := private.ensure_global_league(auth.uid());

  insert into public.league_members (league_id, user_id)
  values (gid, auth.uid())
  on conflict (league_id, user_id) do nothing;

  select * into found from public.leagues where id = gid;
  return found;
end;
$$;

revoke all on function public.join_global_league() from public, anon;
grant execute on function public.join_global_league() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
  computed_initials text;
  parts text[];
  given_name text;
  family_name text;
  gid uuid;
begin
  given_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'given_name', new.raw_user_meta_data ->> 'givenName', '')), '');
  family_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'family_name', new.raw_user_meta_data ->> 'familyName', '')), '');

  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(concat_ws(' ', given_name, family_name)), ''),
    split_part(coalesce(new.email, 'player'), '@', 1)
  );

  parts := regexp_split_to_array(trim(display_name), '\s+');
  if array_length(parts, 1) >= 2 then
    computed_initials := upper(left(parts[1], 1) || left(parts[2], 1));
  else
    computed_initials := upper(left(parts[1], 2));
  end if;
  if length(computed_initials) < 1 then
    computed_initials := 'MD';
  end if;

  insert into public.profiles (id, full_name, initials)
  values (new.id, display_name, computed_initials)
  on conflict (id) do update
    set full_name = excluded.full_name,
        initials = excluded.initials,
        updated_at = now();

  gid := private.ensure_global_league(new.id);

  insert into public.league_members (league_id, user_id)
  values (gid, new.id)
  on conflict (league_id, user_id) do nothing;

  return new;
end;
$$;

insert into public.leagues (name, invite_code, owner_id, is_public)
select 'Matchday Global', 'GLOBAL', id, true
from auth.users
order by created_at
limit 1
on conflict (invite_code) do nothing;

insert into public.league_members (league_id, user_id)
select l.id, p.id
from public.leagues l
cross join public.profiles p
where l.is_public
on conflict (league_id, user_id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read avatars" on storage.objects;
drop policy if exists "Users upload own avatar" on storage.objects;
drop policy if exists "Users update own avatar" on storage.objects;
drop policy if exists "Users delete own avatar" on storage.objects;

create policy "Public read avatars"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

create policy "Users upload own avatar"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users update own avatar"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users delete own avatar"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );
