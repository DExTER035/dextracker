-- DexTrack Supabase Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ========== TASKS ==========
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  priority text default 'medium' check (priority in ('high','medium','low')),
  due_time text,
  done boolean default false,
  created_at timestamptz default now()
);
alter table tasks enable row level security;
create policy "Users own tasks" on tasks for all using (auth.uid() = user_id);

-- ========== HABITS ==========
create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text default '⭐',
  streak int default 0,
  last_done date,
  created_at timestamptz default now()
);
alter table habits enable row level security;
create policy "Users own habits" on habits for all using (auth.uid() = user_id);

-- ========== HABIT LOGS ==========
create table if not exists habit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references habits(id) on delete cascade not null,
  done_date date default current_date
);
alter table habit_logs enable row level security;
create policy "Users own habit_logs" on habit_logs for all using (auth.uid() = user_id);

-- ========== MOOD LOGS ==========
create table if not exists mood_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  value int not null check (value between 1 and 5),
  note text,
  logged_at timestamptz default now()
);
alter table mood_logs enable row level security;
create policy "Users own mood_logs" on mood_logs for all using (auth.uid() = user_id);

-- ========== JOURNAL ENTRIES ==========
create table if not exists journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  pin_hash text,
  created_at timestamptz default now()
);
alter table journal_entries enable row level security;
create policy "Users own journal" on journal_entries for all using (auth.uid() = user_id);

-- ========== MEALS ==========
create table if not exists meals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  meal_type text default 'snack' check (meal_type in ('breakfast','lunch','dinner','snack')),
  calories int default 0,
  protein real default 0,
  carbs real default 0,
  fat real default 0,
  category text default 'other',
  logged_at timestamptz default now()
);
alter table meals enable row level security;
create policy "Users own meals" on meals for all using (auth.uid() = user_id);

-- ========== SLEEP LOGS ==========
create table if not exists sleep_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  hours real not null,
  quality int check (quality between 1 and 5),
  notes text,
  sleep_date date default current_date,
  created_at timestamptz default now()
);
alter table sleep_logs enable row level security;
create policy "Users own sleep_logs" on sleep_logs for all using (auth.uid() = user_id);

-- ========== GOALS ==========
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  deadline date,
  progress int default 0 check (progress between 0 and 100),
  done boolean default false,
  created_at timestamptz default now()
);
alter table goals enable row level security;
create policy "Users own goals" on goals for all using (auth.uid() = user_id);

-- ========== STUDY SESSIONS ==========
create table if not exists study_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  duration_mins int not null,
  session_type text default 'timer' check (session_type in ('timer','pomodoro')),
  started_at timestamptz default now()
);
alter table study_sessions enable row level security;
create policy "Users own study_sessions" on study_sessions for all using (auth.uid() = user_id);

-- ========== GRADES ==========
create table if not exists grades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  score real not null,
  max_score real default 100,
  exam_date date default current_date
);
alter table grades enable row level security;
create policy "Users own grades" on grades for all using (auth.uid() = user_id);

-- ========== NOTES ==========
create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  content text not null,
  created_at timestamptz default now()
);
alter table notes enable row level security;
create policy "Users own notes" on notes for all using (auth.uid() = user_id);

-- ========== WORKOUTS ==========
create table if not exists workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  sport text not null,
  duration_mins int default 30,
  notes text,
  workout_date date default current_date,
  created_at timestamptz default now()
);
alter table workouts enable row level security;
create policy "Users own workouts" on workouts for all using (auth.uid() = user_id);

-- ========== TRANSACTIONS ==========
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount real not null,
  type text check (type in ('income','expense')),
  category text default 'other',
  note text,
  txn_date date default current_date,
  created_at timestamptz default now()
);
alter table transactions enable row level security;
create policy "Users own transactions" on transactions for all using (auth.uid() = user_id);

-- ========== USER PROFILES ==========
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar text,
  tag text unique,
  xp int default 0,
  level int default 1,
  badges jsonb default '[]',
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users own profile" on profiles for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, avatar, tag)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    upper(substring(md5(new.id::text) for 5))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
