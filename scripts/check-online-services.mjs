#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ENV_FILES = ['.env', '.env.local', '.env.production', '.env.production.local'];
const REQUIRED_KEYS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

function parseEnvFile(filePath) {
  const result = {};
  const content = fs.readFileSync(filePath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line;
    const separatorIndex = normalized.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = normalized.slice(0, separatorIndex).trim();
    let value = normalized.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
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

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

const fileEnv = loadMergedEnv();
const onlineServicesEnabled =
  (process.env.VITE_ENABLE_ONLINE_SERVICES ?? fileEnv.VITE_ENABLE_ONLINE_SERVICES ?? '0').trim() === '1';
const resolved = Object.fromEntries(
  REQUIRED_KEYS.map((key) => [key, process.env[key] ?? fileEnv[key] ?? ''])
);

if (!onlineServicesEnabled) {
  console.log('[check-online-services] Online services disabled; skipping live Supabase probes.');
  process.exit(0);
}

for (const key of REQUIRED_KEYS) {
  if (!resolved[key]) {
    console.error(`[check-online-services] Missing ${key}.`);
    process.exit(1);
  }
}

const supabaseUrl = resolved.VITE_SUPABASE_URL.trim().replace(/\/+$/, '');
const supabaseAnonKey = resolved.VITE_SUPABASE_ANON_KEY.trim();

try {
  const authResponse = await fetchWithTimeout(`${supabaseUrl}/auth/v1/settings`, {
    headers: {
      apikey: supabaseAnonKey,
    },
  });

  if (!authResponse.ok) {
    throw new Error(`Auth settings probe failed with ${authResponse.status}`);
  }

  const leaderboardResponse = await fetchWithTimeout(
    `${supabaseUrl}/rest/v1/user_stats?select=user_id&limit=1`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    }
  );

  if (!leaderboardResponse.ok) {
    throw new Error(`Leaderboard probe failed with ${leaderboardResponse.status}`);
  }

  console.log('[check-online-services] Auth and anon leaderboard probes succeeded.');
} catch (error) {
  console.error(`[check-online-services] FAILED: ${(error && error.message) || error}`);
  process.exit(1);
}
