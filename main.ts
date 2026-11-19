// Leonida Ledger — the entry program (Node 22, standard library only).
// The guide itself is plain static files in app/: index.html, its ES modules,
// styles and data, with nothing fetched over the network. This program hands
// the guide in: it copies app/ and screenshots/ from beside this file into the
// output directory and writes dossier.json there with the vendored make.fun
// library. Leave vendor/makefun-frontend.ts untouched — the scorer rebuilds
// the dossier with its own copy and compares the two byte for byte.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps for this competition: the text cap shapes the dossier's
// bytes, and the others refuse an entry the scorer would refuse — more than
// 4 screenshots or one over 256 KiB, or app/ past 993 files and directories
// or 48 MiB (app/ shares /output's own 1,000-entry cap with screenshots/
// and dossier.json, so leave them room).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
