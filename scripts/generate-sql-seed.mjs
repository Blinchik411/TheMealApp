import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

function escapeSql(str) {
  if (str === null || str === undefined) return 'null';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeJson(obj) {
  if (obj === null || obj === undefined) return "'{}'::jsonb";
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function escapeArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return "'{}'::text[]";
  const items = arr.map((item) => `"${String(item).replace(/"/g, '\\"')}"`).join(',');
  return `'${items}'::text[]`;
}

async function main() {
  console.log('📦 Generating Supabase SQL Migration & Seed Script...');

  const meals = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'meals-bilingual.json'), 'utf-8'));
  const categories = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'categories-bilingual.json'), 'utf-8'));
  const areas = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'areas-bilingual.json'), 'utf-8'));
  const mealTypes = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'meal-types-bilingual.json'), 'utf-8'));

  let sql = `-- ============================================================
-- Supabase Schema & Seed for TheMealApp
-- Generated on: ${new Date().toISOString()}
-- Total meals: ${meals.length}
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

-- ============================================================
-- DATA INSERTION / SEEDING
-- ============================================================

`;

  // Categories
  sql += `-- Insert Categories (${categories.length})\n`;
  for (const c of categories) {
    sql += `insert into public.categories (id, slug, name, image_url, description, count) values (${escapeSql(c.id)}, ${escapeSql(c.slug)}, ${escapeJson(c.name)}, ${escapeSql(c.imageUrl)}, ${escapeJson(c.description)}, ${c.count}) on conflict (id) do update set name = excluded.name, count = excluded.count;\n`;
  }

  // Areas
  sql += `\n-- Insert Areas (${areas.length})\n`;
  for (const a of areas) {
    sql += `insert into public.areas (slug, name, count) values (${escapeSql(a.slug)}, ${escapeJson(a.name)}, ${a.count}) on conflict (slug) do update set name = excluded.name, count = excluded.count;\n`;
  }

  // Meal Types
  sql += `\n-- Insert Meal Types (${mealTypes.length})\n`;
  for (const mt of mealTypes) {
    sql += `insert into public.meal_types (id, name, count) values (${escapeSql(mt.id)}, ${escapeJson(mt.name)}, ${mt.count}) on conflict (id) do update set name = excluded.name, count = excluded.count;\n`;
  }

  // Meals in Batches of 50
  sql += `\n-- Insert Meals (${meals.length})\n`;
  const BATCH_SIZE = 50;
  for (let i = 0; i < meals.length; i += BATCH_SIZE) {
    const chunk = meals.slice(i, i + BATCH_SIZE);
    sql += `insert into public.meals (id, slug, name, category, area, meal_type, dietary, servings, prep_time_minutes, cook_time_minutes, total_time_minutes, difficulty, nutrition, image_url, youtube_url, source_url, tags, ingredients, steps, instructions, date_modified) values\n`;

    const rowStrings = chunk.map((m) => {
      return `  (${escapeSql(m.id)}, ${escapeSql(m.slug)}, ${escapeJson(m.name)}, ${escapeJson(m.category)}, ${escapeJson(m.area)}, ${escapeArray(m.mealType)}, ${escapeJson(m.dietary)}, ${m.servings}, ${m.prepTimeMinutes}, ${m.cookTimeMinutes}, ${m.totalTimeMinutes}, ${escapeSql(m.difficulty)}, ${escapeJson(m.nutrition)}, ${escapeSql(m.imageUrl)}, ${escapeSql(m.youtubeUrl)}, ${escapeSql(m.sourceUrl)}, ${escapeJson(m.tags)}, ${escapeJson(m.ingredients)}, ${escapeJson(m.steps)}, ${escapeJson(m.instructions)}, ${escapeSql(m.dateModified)})`;
    });

    sql += `${rowStrings.join(',\n')}\n`;
    sql += `on conflict (id) do update set slug = excluded.slug, name = excluded.name, category = excluded.category, area = excluded.area, meal_type = excluded.meal_type, dietary = excluded.dietary, servings = excluded.servings, prep_time_minutes = excluded.prep_time_minutes, cook_time_minutes = excluded.cook_time_minutes, total_time_minutes = excluded.total_time_minutes, difficulty = excluded.difficulty, nutrition = excluded.nutrition, ingredients = excluded.ingredients, steps = excluded.steps, instructions = excluded.instructions;\n\n`;
  }

  const outputPath = path.join(DATA_DIR, 'supabase-schema-and-seed.sql');
  await fs.writeFile(outputPath, sql, 'utf-8');

  // Also write clean schema-only file for quick reference
  const schemaOnlyPath = path.join(DATA_DIR, 'supabase-schema-only.sql');
  const schemaOnlyContent = sql.split('-- ============================================================\n-- DATA INSERTION')[0];
  await fs.writeFile(schemaOnlyPath, schemaOnlyContent, 'utf-8');

  const stat = await fs.stat(outputPath);
  console.log(`✅ SQL files generated:`);
  console.log(`   - Full seed SQL: ${outputPath} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`   - Schema only: ${schemaOnlyPath}`);
}

main().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
