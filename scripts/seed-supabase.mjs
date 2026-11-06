import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

async function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const content = await fs.readFile(envPath, 'utf-8');
    const env = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      env[key.trim()] = rest.join('=').trim();
    }
    return env;
  } catch {
    return process.env;
  }
}

async function main() {
  console.log('🚀 Supabase Seeder for TheMealApp...\n');
  const env = await loadEnv();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Categories
  const categories = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'categories-bilingual.json'), 'utf-8'));
  console.log(`📦 Seeding ${categories.length} Categories...`);
  const catRows = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    image_url: c.imageUrl,
    description: c.description,
    count: c.count,
  }));
  const { error: catErr } = await supabase.from('categories').upsert(catRows, { onConflict: 'id' });
  if (catErr) console.warn('   Categories upsert note:', catErr.message);
  else console.log('   Categories seeded/updated successfully!');

  // 2. Areas
  const areas = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'areas-bilingual.json'), 'utf-8'));
  console.log(`🌍 Seeding ${areas.length} Areas...`);
  const areaRows = areas.map((a) => ({
    slug: a.slug,
    name: a.name,
    count: a.count,
  }));
  const { error: areaErr } = await supabase.from('areas').upsert(areaRows, { onConflict: 'slug' });
  if (areaErr) console.warn('   Areas upsert note:', areaErr.message);
  else console.log('   Areas seeded/updated successfully!');

  // 3. Meal Types
  const mealTypes = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'meal-types-bilingual.json'), 'utf-8'));
  console.log(`🏷️ Seeding ${mealTypes.length} Meal Types...`);
  const mtRows = mealTypes.map((mt) => ({
    id: mt.id,
    name: mt.name,
    count: mt.count,
  }));
  const { error: mtErr } = await supabase.from('meal_types').upsert(mtRows, { onConflict: 'id' });
  if (mtErr) console.warn('   Meal types upsert note:', mtErr.message);
  else console.log('   Meal types seeded/updated successfully!');

  // 4. Meals in batches of 50
  const meals = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'meals-bilingual.json'), 'utf-8'));
  console.log(`🍲 Seeding ${meals.length} Meals...`);

  const BATCH_SIZE = 50;
  let totalInserted = 0;
  for (let i = 0; i < meals.length; i += BATCH_SIZE) {
    const chunk = meals.slice(i, i + BATCH_SIZE);
    const mealRows = chunk.map((m) => ({
      id: m.id,
      slug: m.slug,
      name: m.name,
      category: m.category,
      area: m.area,
      meal_type: m.mealType,
      dietary: m.dietary,
      servings: m.servings,
      prep_time_minutes: m.prepTimeMinutes,
      cook_time_minutes: m.cookTimeMinutes,
      total_time_minutes: m.totalTimeMinutes,
      difficulty: m.difficulty,
      nutrition: m.nutrition,
      image_url: m.imageUrl,
      youtube_url: m.youtubeUrl,
      source_url: m.sourceUrl,
      tags: m.tags,
      ingredients: m.ingredients,
      steps: m.steps,
      instructions: m.instructions,
      date_modified: m.dateModified,
    }));

    const { error: mealErr } = await supabase.from('meals').upsert(mealRows, { onConflict: 'id' });
    if (mealErr) {
      console.error(`\n❌ Error seeding batch ${i} - ${i + chunk.length}:`, mealErr.message);
      break;
    }
    totalInserted += chunk.length;
    process.stdout.write(`   Seeded/Updated ${totalInserted}/${meals.length} meals...\r`);
  }
  console.log(`\n\n🎉 Supabase seeding completed! Total meals processed: ${totalInserted}`);
}

main().catch((err) => {
  console.error('❌ Seeder failed:', err);
  process.exit(1);
});
