// Program entry point for building the Black Friday deal finder entry.
// Computes all paths relative to this file's location, copies assets,
// and generates dossier.json using the frontend harness.

import { cp, mkdir, stat } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

async function copyIfExists(src: string, dest: string) {
  try {
    const s = await stat(src);
    if (s.isDirectory()) {
      await cp(src, dest, { recursive: true });
    }
  } catch {}
}

async function run() {
  await mkdir(outputDir, { recursive: true });
  await copyIfExists(join(rootDir, 'app'), join(outputDir, 'app'));
  await copyIfExists(join(rootDir, 'screenshots'), join(outputDir, 'screenshots'));

  const dossier = await buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  });

  writeFileSync(join(outputDir, 'dossier.json'), dossier);

  console.log(`Successfully built deal finder entry into ${outputDir}`);
}

run().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
