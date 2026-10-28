import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(desktopRoot, '..');
const out = path.join(desktopRoot, 'frontend');

const env = { ...process.env };
delete env.GITHUB_PAGES;
// El portal de test en Render usa este host. Sin esto el escritorio queda en 127.0.0.1:8000.
if (!String(env.PUBLIC_API_URL || '').trim()) {
  env.PUBLIC_API_URL = 'https://fuerzayacondicionamiento-backend-chv5.onrender.com';
}

const result = spawnSync('npm', ['run', 'build'], {
  cwd: repoRoot,
  stdio: 'inherit',
  env,
});

if (result.status !== 0) process.exit(result.status ?? 1);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(path.join(repoRoot, 'dist'), out, { recursive: true });
console.log(`Front copiado a ${out}`);
