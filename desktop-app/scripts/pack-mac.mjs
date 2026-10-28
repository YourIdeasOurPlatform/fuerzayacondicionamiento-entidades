/**
 * Arma el .app de macOS en Linux (arm64 y x64) y lo deja en un zip.
 * El .dmg lo genera electron-builder en una Mac (`npm run dist:mac` ahí).
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const asar = require('@electron/asar');
const { downloadArtifact } = require('@electron/get');

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = require(path.join(desktopRoot, 'package.json'));
const PRODUCT = 'Fuerza y Acondicionamiento Entidades';
const EXE = 'fuerza-entidades';
const BUNDLE_ID = 'com.yourideasourplatform.fuerzayacondicionamiento.entidades';
const ELECTRON_VERSION = '37.10.3';
const HELPERS = [
  'Electron Helper (Renderer)',
  'Electron Helper (Plugin)',
  'Electron Helper (GPU)',
  'Electron Helper',
];

function setKey(plist, key, value) {
  const pattern = new RegExp(`(<key>${key}</key>\\s*<string>)[\\s\\S]*?(</string>)`);
  if (pattern.test(plist)) return plist.replace(pattern, `$1${value}$2`);
  return plist.replace('<dict>', `<dict>\n\t<key>${key}</key>\n\t<string>${value}</string>`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} falló`);
}

function patchPlist(file, pairs) {
  let plist = readFileSync(file, 'utf8');
  plist = plist.replace(/\t<key>ElectronAsarIntegrity<\/key>\s*<dict>[\s\S]*?\n\t<\/dict>\n/, '');
  for (const [key, value] of pairs) plist = setKey(plist, key, value);
  writeFileSync(file, plist);
}

async function packArch(arch) {
  const zip = await downloadArtifact({
    version: ELECTRON_VERSION,
    artifactName: 'electron',
    platform: 'darwin',
    arch,
  });
  const work = mkdtempSync(path.join(tmpdir(), `entidades-mac-${arch}-`));
  const extracted = path.join(work, 'src');
  run('unzip', ['-q', zip, '-d', extracted]);

  const app = path.join(extracted, `${PRODUCT}.app`);
  run('mv', [path.join(extracted, 'Electron.app'), app]);

  const payload = path.join(work, 'payload');
  mkdirSync(payload, { recursive: true });
  cpSync(path.join(desktopRoot, 'main.cjs'), path.join(payload, 'main.cjs'));
  cpSync(path.join(desktopRoot, 'preload.cjs'), path.join(payload, 'preload.cjs'));
  writeFileSync(
    path.join(payload, 'package.json'),
    JSON.stringify({ name: pkg.name, version: pkg.version, main: 'main.cjs' }, null, 2),
  );

  const resources = path.join(app, 'Contents', 'Resources');
  rmSync(path.join(resources, 'default_app.asar'), { force: true });
  await asar.createPackage(payload, path.join(resources, 'app.asar'));
  cpSync(path.join(desktopRoot, 'frontend'), path.join(resources, 'frontend'), { recursive: true });

  const frameworks = path.join(app, 'Contents', 'Frameworks');
  for (const helper of HELPERS) {
    const suffix = helper.slice('Electron'.length);
    const next = `${PRODUCT}${suffix}`;
    const helperApp = path.join(frameworks, `${helper}.app`);
    const renamedApp = path.join(frameworks, `${next}.app`);
    run('mv', [path.join(helperApp, 'Contents', 'MacOS', helper), path.join(helperApp, 'Contents', 'MacOS', next)]);
    patchPlist(path.join(helperApp, 'Contents', 'Info.plist'), [
      ['CFBundleDisplayName', next],
      ['CFBundleExecutable', next],
      ['CFBundleName', next],
      ['CFBundleIdentifier', `${BUNDLE_ID}.helper`],
    ]);
    run('mv', [helperApp, renamedApp]);
  }

  run('mv', [path.join(app, 'Contents', 'MacOS', 'Electron'), path.join(app, 'Contents', 'MacOS', EXE)]);
  patchPlist(path.join(app, 'Contents', 'Info.plist'), [
    ['CFBundleDisplayName', PRODUCT],
    ['CFBundleExecutable', EXE],
    ['CFBundleName', PRODUCT],
    ['CFBundleIdentifier', BUNDLE_ID],
    ['CFBundleShortVersionString', pkg.version],
    ['CFBundleVersion', pkg.version],
    ['LSApplicationCategoryType', 'public.app-category.business'],
  ]);

  const out = path.join(desktopRoot, 'release', `${PRODUCT}-${pkg.version}-mac-${arch}.zip`);
  rmSync(out, { force: true });
  run('zip', ['-r', '-y', '-q', out, `${PRODUCT}.app`], { cwd: extracted });
  rmSync(work, { recursive: true, force: true });
  console.log(out);
}

mkdirSync(path.join(desktopRoot, 'release'), { recursive: true });
for (const arch of ['arm64', 'x64']) {
  await packArch(arch);
}
