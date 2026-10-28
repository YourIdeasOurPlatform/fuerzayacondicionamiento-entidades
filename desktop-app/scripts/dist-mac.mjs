import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

if (process.platform === 'darwin') {
  const builder = path.join(desktopRoot, 'node_modules', 'electron-builder', 'cli.js');
  const result = spawnSync(process.execPath, [builder, '--mac'], {
    cwd: desktopRoot,
    stdio: 'inherit',
  });
  process.exit(result.status ?? 1);
}

const result = spawnSync(process.execPath, [path.join(desktopRoot, 'scripts', 'pack-mac.mjs')], {
  cwd: desktopRoot,
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
