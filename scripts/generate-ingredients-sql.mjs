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

async function main() {
  console.log('Generating update-ingredients.sql...');
  const meals = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'meals-bilingual.json'), 'utf-8'));

  let sql = `-- ============================================================
-- SQL Update Cleaned Ingredients & Measures for All Meals
-- ============================================================

`;

  for (const m of meals) {
    sql += `update public.meals set ingredients = ${escapeJson(m.ingredients)} where id = ${escapeSql(m.id)};\n`;
  }

  const outPath = path.join(DATA_DIR, 'update-ingredients.sql');
  await fs.writeFile(outPath, sql, 'utf-8');

  // Also regenerate full schema and seed
  const { execSync } = await import('node:child_process');
  execSync('node scripts/generate-sql-seed.mjs', { stdio: 'inherit' });

  const stat = await fs.stat(outPath);
  console.log(`✅ Saved: ${outPath} (${(stat.size / 1024).toFixed(1)} KB)`);
}

main().catch(console.error);
