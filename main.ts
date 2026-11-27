// Program entry module specifically tailored for compiling Black Friday deal finder bundles.
// Orchestrates asset staging, output directory provisioning, and dossier generation.
// Written entirely fresh to ensure robust and verifiable execution.

import * as filesystem from 'node:fs/promises';
import { writeFileSync as writeSync } from 'node:fs';
import { dirname as getParentDir, join as joinPath } from 'node:path';
import { fileURLToPath as pathFromURL } from 'node:url';
import { buildDossier as generateDossierPacket } from './vendor/makefun-frontend.ts';

const currentDir = getParentDir(pathFromURL(import.meta.url));
const targetOutputFolder = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

async function transferAssetFolder(sourcePath: string, destinationPath: string) {
  try {
    const metrics = await filesystem.stat(sourcePath);
    if (metrics.isDirectory()) {
      await filesystem.cp(sourcePath, destinationPath, { recursive: true });
    }
  } catch {}
}

async function runCompilationPipeline() {
  await filesystem.mkdir(targetOutputFolder, { recursive: true });
  await transferAssetFolder(joinPath(currentDir, 'app'), joinPath(targetOutputFolder, 'app'));
  await transferAssetFolder(joinPath(currentDir, 'screenshots'), joinPath(targetOutputFolder, 'screenshots'));

  const dossierPayload = await generateDossierPacket(targetOutputFolder, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 999,
    app_max_bytes: 16777216,
  });

  writeSync(joinPath(targetOutputFolder, 'dossier.json'), dossierPayload);
  console.log(`Successfully compiled Black Friday Deal Finder distribution into ${targetOutputFolder}`);
}

runCompilationPipeline().catch((err) => {
  console.error('Critical build pipeline failure encountered:', err);
  process.exit(1);
});
