import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const electronCli = path.join(desktopRoot, 'node_modules', 'electron', 'cli.js');

const child = spawn(process.execPath, [electronCli, '.'], {
  cwd: desktopRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    ELECTRON_START_URL: process.env.ELECTRON_START_URL || 'http://127.0.0.1:4322',
  },
});

child.on('exit', (code) => process.exit(code ?? 0));
