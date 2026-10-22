import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [mode, ...rawArgs] = process.argv.slice(2);
const commands = { browsers: ['install', 'chromium', 'webkit'], e2e: ['test'], production: ['test'] };
if (!Object.hasOwn(commands, mode)) {
  console.error('Usage: node scripts/project-runtime.mjs <browsers|e2e|production> [--dry-run] [Playwright arguments]');
  process.exit(2);
}
const dryRun = rawArgs.includes('--dry-run');
const args = rawArgs.filter(arg => arg !== '--dry-run');
const cli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: path.join(root, '.workbuddy-cache', 'browsers'),
  E2E_MODE: mode === 'production' ? 'production' : 'development' };
if (dryRun) {
  console.log(JSON.stringify({ executable: process.execPath, args: [cli, ...commands[mode], ...args], cwd: root,
    environment: { PLAYWRIGHT_BROWSERS_PATH: env.PLAYWRIGHT_BROWSERS_PATH, E2E_MODE: env.E2E_MODE } }, null, 2));
} else {
  if (!existsSync(cli)) {
    console.error('Project dependencies are missing. Run npm ci first, then npm run setup:browsers.');
    process.exit(1);
  }
  const child = spawn(process.execPath, [cli, ...commands[mode], ...args], { cwd: root, env, stdio: 'inherit' });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', (code, signal) => { process.exitCode = code ?? (signal === 'SIGINT' ? 130 : 1); });
}
