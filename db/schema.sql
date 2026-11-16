-- Bengaluru Bingo: database schema (PostgreSQL / Supabase)
-- Not yet connected. The app runs local-first; run this in a Supabase project
-- and set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to switch storage on.
--
-- No PII anywhere: players are a random anonymous_id generated in the browser.

create table if not exists scores (
  anonymous_id uuid primary key,
  -- The 25 tiles as five base-36 characters; the card itself.
  card_code    text        not null check (card_code ~ '^[0-9a-z]{5}$'),
  percent      smallint    not null check (percent between 0 and 100),
  bingo_lines  smallint    not null check (bingo_lines between 0 and 12),
  badge        text        not null,
  season       text        check (season in ('summer', 'monsoon', 'winter', 'spring')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Card clubbing: two cards joined into one Bingo Journey.
create table if not exists journeys (
  id           uuid primary key default gen_random_uuid(),
  card_a       text        not null check (card_a ~ '^[0-9a-z]{5}$'),
  card_b       text        not null check (card_b ~ '^[0-9a-z]{5}$'),
  created_by   uuid        references scores (anonymous_id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (card_a, card_b)
);

create index if not exists scores_percent_idx on scores (percent desc);

create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists scores_touch on scores;
create trigger scores_touch before update on scores
  for each row execute function touch_updated_at();

-- Only the server (service role) writes; nothing is readable by anonymous clients.
alter table scores enable row level security;
alter table journeys enable row level security;
