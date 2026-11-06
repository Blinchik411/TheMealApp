-- ============================================================
-- Supabase Schema & Seed for TheMealApp
-- Generated on: 2026-11-02T20:01:47.873Z
-- Total meals: 793
-- ============================================================

-- 0. Extensions
create extension if not exists pg_trgm;

-- 1. Categories Table
create table if not exists public.categories (
  id text primary key,
  slug text unique not null,
  name jsonb not null,
  image_url text not null,
  description jsonb not null,
  count integer default 0
);

-- 2. Areas (Cuisines) Table
create table if not exists public.areas (
  slug text primary key,
  name jsonb not null,
  count integer default 0
);

-- 3. Meal Types Table
create table if not exists public.meal_types (
  id text primary key,
  name jsonb not null,
  count integer default 0
);

-- 4. Meals Table
create table if not exists public.meals (
  id text primary key,
  slug text unique not null,
  name jsonb not null,
  category jsonb not null,
  area jsonb not null,
  meal_type text[] not null default '{}',
  dietary jsonb not null default '{}'::jsonb,
  servings integer not null default 4,
  prep_time_minutes integer not null default 10,
  cook_time_minutes integer not null default 20,
  total_time_minutes integer not null default 30,
  difficulty text not null default 'easy',
  nutrition jsonb not null default '{}'::jsonb,
  image_url text not null,
  youtube_url text,
  source_url text,
  tags jsonb not null default '{"en": [], "ru": []}'::jsonb,
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '{"en": "", "ru": ""}'::jsonb,
  date_modified text,
  created_at timestamptz default now()
);

-- 5. Indexes
create index if not exists idx_meals_slug on public.meals(slug);
create index if not exists idx_meals_total_time on public.meals(total_time_minutes);
create index if not exists idx_meals_difficulty on public.meals(difficulty);
create index if not exists idx_meals_meal_type on public.meals using gin(meal_type);
create index if not exists idx_meals_dietary on public.meals using gin(dietary);
create index if not exists idx_meals_name_en_trgm on public.meals using gin((name->>'en') gin_trgm_ops);
create index if not exists idx_meals_name_ru_trgm on public.meals using gin((name->>'ru') gin_trgm_ops);

-- 6. Row Level Security (Public Read)
alter table public.categories enable row level security;
alter table public.areas enable row level security;
alter table public.meal_types enable row level security;
alter table public.meals enable row level security;

drop policy if exists "Allow public read access to categories" on public.categories;
create policy "Allow public read access to categories" on public.categories for select using (true);

drop policy if exists "Allow public read access to areas" on public.areas;
create policy "Allow public read access to areas" on public.areas for select using (true);

drop policy if exists "Allow public read access to meal_types" on public.meal_types;
create policy "Allow public read access to meal_types" on public.meal_types for select using (true);

drop policy if exists "Allow public read access to meals" on public.meals;
create policy "Allow public read access to meals" on public.meals for select using (true);

