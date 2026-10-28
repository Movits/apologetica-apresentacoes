// Carrega os decks no Node do mesmo jeito que o navegador: roda os arquivos
// num contexto vm onde `window` é o próprio global, na ordem do deck.html.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function loadDecks({ withData = true } = {}) {
  const ctx = { console };
  ctx.window = ctx;
  vm.createContext(ctx);
  const run = (rel) => vm.runInContext(readFileSync(join(ROOT, rel), 'utf8'), ctx, { filename: rel });

  const errors = [];
  const warnings = [];
  if (withData) {
    for (const f of ['data/refs.js', 'data/articles.js']) {
      if (existsSync(join(ROOT, f))) run(f);
      else errors.push(`${f} não existe: rode node scripts/sync-refs.mjs`);
    }
  }
  run('engine/core.js');
  run('decks/index.js');
  const ids = Array.isArray(ctx.APG_DECKS) ? ctx.APG_DECKS : [];
  if (!ids.length) errors.push('decks/index.js não definiu window.APG_DECKS');

  for (const id of ids) {
    const f = `decks/${id}.js`;
    if (!existsSync(join(ROOT, f))) {
      errors.push(`${f}: listado em decks/index.js mas o arquivo não existe`);
      continue;
    }
    try {
      run(f);
    } catch (e) {
      errors.push(`${f}: ${e.message}`);
      continue;
    }
    if (!ctx.APG.decks[id]) errors.push(`${f}: não chamou deck({ id: '${id}', ... })`);
  }

  const listed = new Set(ids.map((id) => `${id}.js`));
  for (const f of readdirSync(join(ROOT, 'decks'))) {
    if (f.endsWith('.js') && f !== 'index.js' && !listed.has(f)) {
      warnings.push(`decks/${f} não está em decks/index.js (não aparece na galeria nem é checado)`);
    }
  }

  return { APG: ctx.APG, ids, errors, warnings };
}
