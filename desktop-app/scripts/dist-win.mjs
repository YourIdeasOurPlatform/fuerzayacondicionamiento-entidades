import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const builder = path.join(desktopRoot, 'node_modules', 'electron-builder', 'cli.js');
const args = [builder, '--win'];

// El instalador NSIS (.exe) corre makensis y después Wine. En Linux Wine
// no llega a armar el setup; el zip sí queda listo para el Release.
if (process.platform !== 'win32') args.push('zip');

const result = spawnSync(process.execPath, args, { cwd: desktopRoot, stdio: 'inherit' });
process.exit(result.status ?? 1);
