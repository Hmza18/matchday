create table public.picks (
  user_id uuid not null references auth.users (id) on delete cascade,
  fixture_id text not null,
  home_score smallint not null check (home_score >= 0 and home_score <= 9),
  away_score smallint not null check (away_score >= 0 and away_score <= 9),
  gameweek smallint not null check (gameweek >= 1 and gameweek <= 38),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, fixture_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.picks enable row level security;

create policy "Users can read own picks"
  on public.picks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own picks"
  on public.picks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own picks"
  on public.picks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger picks_updated_at
  before update on public.picks
  for each row
  execute function public.set_updated_at();
