// Traz do app só o que os decks usam:
//   - data/refs.js: as referências citadas nos decks (texto, ref, autor, ano,
//     fonte completa, url, palavra original, bibleNav e a tradução EN);
//   - data/articles.js: título, obra e crédito dos artigos ligados aos decks
//     (campo `article`), mais a cópia da imagem para assets/art/;
//   - assets/art/: qualquer imagem `assets/art/<arquivo>` usada num deck que
//     ainda não exista aqui e exista em assets/articles/ do app.
//
//   node scripts/sync-refs.mjs            (app em ../apologetica-app)
//   APG_APP_DIR=/outro/caminho node scripts/sync-refs.mjs
//
// Sai com código 1 se algum id de referência não existir no app.

import { writeFileSync, existsSync, copyFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadDecks, ROOT } from './lib/load-decks.mjs';

// Os arquivos do app são ESM sem "type": "module" no package.json dele, e o
// Node avisa a cada import. O aviso não diz respeito a este repo.
process.removeAllListeners('warning');
process.on('warning', (w) => {
  if (w.code !== 'MODULE_TYPELESS_PACKAGE_JSON') console.warn(w);
});

const APP = process.env.APG_APP_DIR || join(ROOT, '..', 'apologetica-app');
const appFile = (p) => join(APP, p);
if (!existsSync(appFile('src/data/references.js'))) {
  console.error(`Não achei o app em ${APP}. Defina APG_APP_DIR com o caminho do apologetica-app.`);
  process.exit(1);
}

const { APG, ids, errors } = loadDecks({ withData: false });
if (errors.length) {
  console.error(errors.map((e) => `erro: ${e}`).join('\n'));
  process.exit(1);
}

// ---------- Referências ----------

const usedBy = new Map();
for (const id of ids) {
  for (const refId of APG.collectRefIds(APG.decks[id])) {
    if (!usedBy.has(refId)) usedBy.set(refId, []);
    usedBy.get(refId).push(id);
  }
}

const { references } = await import(pathToFileURL(appFile('src/data/references.js')).href);
const { referencesEn } = await import(pathToFileURL(appFile('src/data/references-en.js')).href);
const byId = new Map(references.map((r) => [r.id, r]));

const FIELDS = ['id', 'source', 'ref', 'text', 'author', 'year', 'fullSource', 'url', 'originalLanguage', 'bibleNav'];
const EN_FIELDS = { refEn: 'ref', textEn: 'text', authorEn: 'author', yearEn: 'year', fullSourceEn: 'fullSource', urlEn: 'url', meaningEn: 'meaning' };

const out = {};
const missing = [];
for (const refId of [...usedBy.keys()].sort()) {
  const r = byId.get(refId);
  if (!r) {
    missing.push(`${refId} (usada em ${usedBy.get(refId).join(', ')})`);
    continue;
  }
  const item = {};
  for (const f of FIELDS) if (r[f] != null && r[f] !== '') item[f] = r[f];
  const en = referencesEn[refId];
  if (en) {
    const e = {};
    for (const [from, to] of Object.entries(EN_FIELDS)) if (en[from]) e[to] = en[from];
    if (Object.keys(e).length) item.en = e;
  }
  out[refId] = item;
}

if (missing.length) {
  console.error(`erro: ${missing.length} referência(s) não existem no app:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}

const header = (what) => `// Gerado por scripts/sync-refs.mjs a partir de ${what} do apologetica-app.
// Não edite à mão: mude o app (ou o deck) e rode \`node scripts/sync-refs.mjs\`.
`;
writeFileSync(
  join(ROOT, 'data/refs.js'),
  `${header('src/data/references.js e references-en.js')}(window.APG = window.APG || {}).refs = ${JSON.stringify(out, null, 2)};\n`,
);

// ---------- Artigos e imagens ----------

mkdirSync(join(ROOT, 'assets/art'), { recursive: true });
const copied = [];
const copyArt = (file) => {
  const dest = join(ROOT, 'assets/art', file);
  const src = appFile(join('assets/articles', file));
  if (existsSync(dest)) return true;
  if (!existsSync(src)) return false;
  copyFileSync(src, dest);
  copied.push(file);
  return true;
};

const articleIds = [...new Set(ids.map((id) => APG.decks[id].article).filter((a) => a != null))];
const articlesOut = {};
if (articleIds.length) {
  // Os arquivos de artigos usam require() para as imagens (Metro). Aqui o
  // require devolve o próprio caminho, que é só o que interessa.
  globalThis.require = (p) => p;
  const all = new Map();
  const dir = appFile('src/data/articles');
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.js') && x !== 'index.js')) {
    const mod = await import(pathToFileURL(join(dir, f)).href);
    for (const a of mod.default || []) all.set(a.id, a);
  }
  for (const aid of articleIds.sort((a, b) => a - b)) {
    const a = all.get(aid);
    if (!a) {
      console.error(`erro: artigo ${aid} não existe no app`);
      process.exit(1);
    }
    const file = typeof a.image === 'string' ? basename(a.image) : null;
    const entry = { id: a.id, title: a.title, category: a.category };
    if (file && copyArt(file)) {
      entry.image = `assets/art/${file}`;
      if (a.imageCredit) entry.credit = a.imageCredit;
      if (a.imageAlt) entry.alt = a.imageAlt;
      if (a.imageAspect) entry.aspect = a.imageAspect;
    }
    articlesOut[aid] = entry;
  }
}
writeFileSync(
  join(ROOT, 'data/articles.js'),
  `${header('src/data/articles/')}(window.APG = window.APG || {}).articles = ${JSON.stringify(articlesOut, null, 2)};\n`,
);

// Imagens que os decks pedem em assets/art/ e que vêm do app.
for (const id of ids) {
  for (const img of APG.collectImages(APG.decks[id])) {
    const m = img.match(/^assets\/art\/([^/]+)$/);
    if (m) copyArt(m[1]);
  }
}

console.log(`data/refs.js: ${Object.keys(out).length} referências de ${ids.length} deck(s).`);
console.log(`data/articles.js: ${Object.keys(articlesOut).length} artigo(s).`);
if (copied.length) console.log(`assets/art/: copiadas do app ${copied.join(', ')}.`);
