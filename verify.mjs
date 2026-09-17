// Recompute every manifest's file hashes and the manifest chain. No dependencies.
import { readFileSync, readdirSync, existsSync } from 'fs';
import { createHash } from 'crypto';
const sha = b => createHash('sha256').update(b).digest('hex');
const days = readdirSync('manifests').filter(f => f.endsWith('.json')).sort();
let prev = '0'.repeat(64), bad = 0;
for (const f of days) {
  const raw = readFileSync('manifests/' + f);
  const m = JSON.parse(raw);
  if (m.prev !== prev) { console.log('BROKEN LINK', f); bad++; }
  for (const [p, h] of Object.entries(m.files)) {
    if (!existsSync(p)) { console.log('MISSING', p); bad++; continue; }
    if (p.startsWith('chain/')) {
      // The day's chain line, as committed in the manifest, must appear in the file.
      const line = m.chainLines[p];
      if (sha(line) !== h || !readFileSync(p, 'utf8').split('\n').includes(line)) { console.log('CHAIN LINE MISMATCH', p); bad++; }
      continue;
    }
    if (sha(readFileSync(p)) !== h) { console.log('HASH MISMATCH', p); bad++; }
  }
  prev = sha(raw);
}
console.log(bad ? bad + ' problem(s)' : 'OK: ' + days.length + ' day(s), head ' + prev);
process.exit(bad ? 1 : 0);
