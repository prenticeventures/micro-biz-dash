#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_EXPECTED_REF = 'zbtbtmybzuutxfntdyvp';
const SUPABASE_HOST_REGEX = /([a-z0-9]{20})\.supabase\.co/g;

function parseArgs(argv) {
  const parsed = {
    dir: '',
    expectedRef: DEFAULT_EXPECTED_REF,
    context: 'bundle',
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dir') {
      parsed.dir = argv[++i] ?? '';
    } else if (arg === '--expected-ref') {
      parsed.expectedRef = argv[++i] ?? DEFAULT_EXPECTED_REF;
    } else if (arg === '--context') {
      parsed.context = argv[++i] ?? 'bundle';
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!parsed.dir) {
    throw new Error('Missing required argument: --dir <directory>');
  }

  return parsed;
}

function collectBundleFiles(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Directory does not exist: ${dir}`);
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.startsWith('index-') && file.endsWith('.js'))
    .map((file) => path.join(dir, file));
}

function collectProjectRefs(files) {
  const refs = new Set();

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(SUPABASE_HOST_REGEX)) {
      refs.add(match[1]);
    }
  }

  return refs;
}

function main() {
  try {
    const { dir, expectedRef, context } = parseArgs(process.argv);
    const files = collectBundleFiles(dir);

    if (files.length === 0) {
      throw new Error(`No JS bundle files found in ${dir} (expected index-*.js).`);
    }

    const refs = collectProjectRefs(files);

    if (refs.size === 0) {
      throw new Error(`No Supabase project refs found in ${context} files at ${dir}.`);
    }

    if (!refs.has(expectedRef)) {
      throw new Error(
        `Expected Supabase ref "${expectedRef}" not found in ${context}. Found: ${Array.from(refs).join(', ')}`
      );
    }

    const unexpectedRefs = Array.from(refs).filter((ref) => ref !== expectedRef);
    if (unexpectedRefs.length > 0) {
      throw new Error(
        `Unexpected Supabase refs in ${context}: ${unexpectedRefs.join(', ')}. Expected only "${expectedRef}".`
      );
    }

    console.log(`[verify-supabase-ref] ${context} is targeting expected project: ${expectedRef}`);
  } catch (error) {
    console.error(`[verify-supabase-ref] FAILED: ${(error && error.message) || error}`);
    process.exit(1);
  }
}

main();
