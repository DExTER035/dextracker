-- DexTracker: tables + RLS
-- Apply in Supabase SQL editor. Requires "uuid-ossp" extension.

create extension if not exists "uuid-ossp";

-- PROFILES (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar text,
  xp integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  best_streak integer not null default 0,
  last_active date
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- TASKS
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  priority text not null default 'medium' check (priority in ('high','medium','low')),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "tasks_crud_own" on public.tasks
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- HABITS
create table if not exists public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '🔥',
  streak integer not null default 0,
  completed_dates jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.habits enable row level security;
create policy "habits_crud_own" on public.habits
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- MOOD LOGS
create table if not exists public.mood_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  value integer not null check (value between 1 and 5),
  label text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.mood_logs enable row level security;
create policy "mood_logs_crud_own" on public.mood_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- JOURNAL ENTRIES
create table if not exists public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.journal_entries enable row level security;
create policy "journal_entries_crud_own" on public.journal_entries
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- HEALTH: FOOD
create table if not exists public.health_food (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  calories integer not null default 0,
  protein integer not null default 0,
  carbs integer not null default 0,
  fat integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.health_food enable row level security;
create policy "health_food_crud_own" on public.health_food
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- HEALTH: WATER (one row per day)
create table if not exists public.health_water (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  glasses integer not null default 0 check (glasses >= 0),
  date date not null default current_date,
  unique (user_id, date)
);

alter table public.health_water enable row level security;
create policy "health_water_crud_own" on public.health_water
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- HEALTH: SLEEP (one row per day)
create table if not exists public.health_sleep (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hours numeric(4,1) not null default 0,
  quality integer not null default 3 check (quality between 1 and 5),
  date date not null default current_date,
  unique (user_id, date)
);

alter table public.health_sleep enable row level security;
create policy "health_sleep_crud_own" on public.health_sleep
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- HEALTH: WEIGHT (one row per day)
create table if not exists public.health_weight (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight numeric(6,2) not null,
  date date not null default current_date,
  unique (user_id, date)
);

alter table public.health_weight enable row level security;
create policy "health_weight_crud_own" on public.health_weight
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FINANCE TRANSACTIONS
create table if not exists public.finance_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  amount numeric(12,2) not null check (amount >= 0),
  category text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.finance_transactions enable row level security;
create policy "finance_transactions_crud_own" on public.finance_transactions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- GOALS
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  deadline date,
  milestones jsonb not null default '[]'::jsonb,
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;
create policy "goals_crud_own" on public.goals
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- STUDY SESSIONS
create table if not exists public.study_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  duration integer not null default 0, -- minutes
  type text not null default 'timer',
  created_at timestamptz not null default now()
);

alter table public.study_sessions enable row level security;
create policy "study_sessions_crud_own" on public.study_sessions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- FITNESS WORKOUTS
create table if not exists public.fitness_workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity text not null,
  duration integer not null default 0, -- minutes
  calories integer not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.fitness_workouts enable row level security;
create policy "fitness_workouts_crud_own" on public.fitness_workouts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- USER SETTINGS
create table if not exists public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gemini_key text,
  theme text not null default 'dark',
  language text not null default 'English',
  section_colors jsonb not null default '{}'::jsonb,
  notification_prefs jsonb not null default '{}'::jsonb,
  unique (user_id)
);

alter table public.user_settings enable row level security;
create policy "user_settings_crud_own" on public.user_settings
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Optional: helpful indexes
create index if not exists idx_tasks_user_created on public.tasks (user_id, created_at desc);
create index if not exists idx_habits_user_created on public.habits (user_id, created_at desc);
create index if not exists idx_mood_user_created on public.mood_logs (user_id, created_at desc);
create index if not exists idx_food_user_created on public.health_food (user_id, created_at desc);
create index if not exists idx_fin_user_created on public.finance_transactions (user_id, created_at desc);
create index if not exists idx_study_user_created on public.study_sessions (user_id, created_at desc);
create index if not exists idx_fit_user_created on public.fitness_workouts (user_id, created_at desc);
