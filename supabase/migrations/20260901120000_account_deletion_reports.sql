-- In-app account deletion (Apple Guideline 5.1.1(v)) and chat message reporting.

create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_user_account() from public;
grant execute on function public.delete_user_account() to authenticated;

create table if not exists public.message_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.league_messages (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (message_id, reporter_id)
);

alter table public.message_reports enable row level security;

create policy "Users can report messages"
  on public.message_reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_id);

create policy "Users can read own reports"
  on public.message_reports
  for select
  to authenticated
  using (auth.uid() = reporter_id);
