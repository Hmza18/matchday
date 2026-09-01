-- Stop league members (everyone in Matchday Global) from reading another
-- player's pick before that fixture kicks off. Without this, any signed-in
-- user can `select * from picks` and copy Saturday's scores on Thursday.

alter table public.picks
  add column if not exists kickoff_at timestamptz;

-- GW1–2 of 2026-27 are already complete, so those rows can be scored on the
-- board. Later gameweeks stay hidden until the client writes a real kickoff.
update public.picks
set kickoff_at = '2026-08-31T22:00:00Z'
where kickoff_at is null
  and gameweek <= 2;

create or replace function public.freeze_pick_kickoff()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.kickoff_at is not null then
    new.kickoff_at := old.kickoff_at;
  end if;
  return new;
end;
$$;

drop trigger if exists picks_freeze_kickoff on public.picks;
create trigger picks_freeze_kickoff
  before update on public.picks
  for each row
  execute function public.freeze_pick_kickoff();

drop policy if exists "League members can read fellow picks" on public.picks;

create policy "League members can read fellow picks"
  on public.picks
  for select
  to authenticated
  using (
    private.shares_league_with(user_id)
    and kickoff_at is not null
    and kickoff_at <= now()
  );
