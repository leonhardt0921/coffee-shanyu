import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try {
  const contract = JSON.parse(readFileSync(path.join(root, 'experiment-contract.json'), 'utf8'));
  let changed = false;
  for (const [relative, expected] of Object.entries(contract.files)) {
    const actual = createHash('sha256').update(readFileSync(path.join(root, relative))).digest('hex');
    if (actual !== expected) { console.error('CHANGED: ' + relative); changed = true; }
  }
  if (changed) process.exitCode = 1;
  else console.log('Frozen requirements and acceptance match ' + contract.id + '. This is not a functional test result.');
} catch (error) {
  console.error('Cannot verify contract: ' + error.message);
  process.exitCode = 1;
}
