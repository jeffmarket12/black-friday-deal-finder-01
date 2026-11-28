// Program entry module: compiles and packages the Black Friday Deal Finder v3 distribution.
// Freshly structured bundle builder resolving paths via import.meta.url.

import { promises as fs } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

async function copyDir(src: string, dest: string) {
  try {
    const stats = await fs.stat(src);
    if (stats.isDirectory()) {
      await fs.cp(src, dest, { recursive: true });
    }
  } catch {}
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  await copyDir(join(rootDir, 'app'), join(outputDir, 'app'));
  await copyDir(join(rootDir, 'screenshots'), join(outputDir, 'screenshots'));

  const dossier = await buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 999,
    app_max_bytes: 16777216,
  });

  writeFileSync(join(outputDir, 'dossier.json'), dossier);
  console.log(`Black Friday Deal Finder v3 bundle generated in ${outputDir}`);
}

main().catch(err => {
  console.error('Bundle generation failed:', err);
  process.exit(1);
});
