import { cp, mkdir, stat } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const baseDir = dirname(fileURLToPath(import.meta.url));
const destDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

async function copyFolder(srcPath: string, destPath: string) {
  try {
    const info = await stat(srcPath);
    if (info.isDirectory()) {
      await cp(srcPath, destPath, { recursive: true });
    }
  } catch {}
}

async function execute() {
  await mkdir(destDir, { recursive: true });
  await copyFolder(join(baseDir, 'app'), join(destDir, 'app'));
  await copyFolder(join(baseDir, 'screenshots'), join(destDir, 'screenshots'));

  const dossierContent = await buildDossier(destDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 999,
    app_max_bytes: 16777216,
  });

  writeFileSync(join(destDir, 'dossier.json'), dossierContent);
  console.log(`Successfully generated Black Friday deal finder dossier in ${destDir}`);
}

execute().catch((err) => {
  console.error('Failed to generate dossier:', err);
  process.exit(1);
});
