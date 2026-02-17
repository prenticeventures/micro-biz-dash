#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const MODE = process.env.NODE_ENV || 'production';
const ENV_FILES = [
  '.env',
  '.env.local',
  `.env.${MODE}`,
  `.env.${MODE}.local`,
];

function parseEnvFile(filePath) {
  const out = {};
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const withoutExport = line.startsWith('export ') ? line.slice(7).trim() : line;
    const eqIndex = withoutExport.indexOf('=');
    if (eqIndex <= 0) continue;

    const key = withoutExport.slice(0, eqIndex).trim();
    let value = withoutExport.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    out[key] = value;
  }

  return out;
}

function loadMergedEnv() {
  const merged = {};
  for (const relPath of ENV_FILES) {
    const absPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(absPath)) continue;
    Object.assign(merged, parseEnvFile(absPath));
  }
  return merged;
}

const fileEnv = loadMergedEnv();
const requiredKeys = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const resolved = Object.fromEntries(
  requiredKeys.map((key) => [key, process.env[key] ?? fileEnv[key] ?? ''])
);

const errors = [];

for (const key of requiredKeys) {
  const value = resolved[key].trim();
  if (!value) {
    errors.push(`${key} is missing.`);
    continue;
  }

  if (value.includes('[your-') || value.includes('YOUR_')) {
    errors.push(`${key} still contains a placeholder value.`);
  }
}

if (resolved.VITE_SUPABASE_URL && !/^https?:\/\/.+/i.test(resolved.VITE_SUPABASE_URL)) {
  errors.push('VITE_SUPABASE_URL must be a valid http(s) URL.');
}

if (resolved.VITE_SUPABASE_ANON_KEY && resolved.VITE_SUPABASE_ANON_KEY.length < 20) {
  errors.push('VITE_SUPABASE_ANON_KEY looks too short.');
}

if (errors.length > 0) {
  console.error('\n[validate-env] Supabase environment validation failed:\n');
  for (const err of errors) {
    console.error(`- ${err}`);
  }
  console.error('\nFix by creating/updating .env.local (see .env.example).\n');
  process.exit(1);
}

console.log('[validate-env] Required Supabase env vars are present.');
