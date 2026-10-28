// Valida os decks antes de gravar: tipos de slide, campos obrigatórios,
// passos, ids de referência (em data/refs.js), destaques que existem no texto
// e imagens que existem no disco. Sai com código 1 se houver erro.
//
//   node scripts/check-decks.mjs

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadDecks, ROOT } from './lib/load-decks.mjs';

const { APG, ids, errors, warnings } = loadDecks();
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const imageOk = (where, spec, def) => {
  if (!spec) return;
  if (spec === 'article') {
    if (def.article == null) err(where, "image: 'article' pede o campo `article` no deck");
    else if (!APG.articles[def.article] || !APG.articles[def.article].image) {
      err(where, `artigo ${def.article} sem imagem em data/articles.js (rode node scripts/sync-refs.mjs)`);
    }
    return;
  }
  if (/^https?:/.test(spec)) {
    warn(where, `imagem remota (${spec}) não abre sem internet; prefira assets/art/`);
    return;
  }
  if (!existsSync(join(ROOT, spec))) err(where, `imagem não existe: ${spec}`);
};

const textOf = (s, ref, lang) => {
  if (s.text) return s.text;
  return APG.refField(ref, 'text', lang);
};

const checkHighlights = (where, s, text) => {
  const words = APG.words(text);
  const taken = new Set();
  for (const phrase of APG.highlightList(s.highlight)) {
    const hit = APG.findPhrase(words, phrase, taken);
    if (!hit) err(where, `destaque "${phrase}" não aparece no texto`);
    else for (let i = hit[0]; i < hit[1]; i++) taken.add(i);
  }
};

const checkItems = (where, items, label = 'items') => {
  if (!Array.isArray(items) || !items.length) {
    err(where, `${label} precisa ser uma lista com pelo menos um item`);
    return;
  }
  items.forEach((it, i) => {
    const text = typeof it === 'string' ? it : it && it.text;
    if (!text) err(where, `${label}[${i}] sem texto`);
    if (it && typeof it === 'object' && it.ref && !APG.ref(it.ref)) err(where, `${label}[${i}].ref "${it.ref}" não está em data/refs.js`);
  });
};

let slideTotal = 0;
for (const id of ids) {
  const def = APG.decks[id];
  if (!def) continue;
  const at = `decks/${id}.js`;
  if (def.id !== id) err(at, `o id do deck ("${def.id}") precisa ser igual ao nome do arquivo`);
  if (!def.title) err(at, 'deck sem title');
  if (def.theme && !APG.THEMES.includes(def.theme)) err(at, `tema "${def.theme}" não existe (${APG.THEMES.join(', ')})`);
  if (def.lang && !['pt', 'en'].includes(def.lang)) err(at, `lang "${def.lang}" inválido (pt ou en)`);
  imageOk(at, def.cover, def);
  if (!Array.isArray(def.slides) || !def.slides.length) {
    err(at, 'deck sem slides');
    continue;
  }
  const lang = def.lang || 'pt';

  def.slides.forEach((s, i) => {
    const where = `${at} slide ${i + 1}${s && s.type ? ` (${s.type})` : ''}`;
    slideTotal++;
    const type = s && APG.TYPES[s.type];
    if (!type) {
      err(where, `tipo "${s && s.type}" não existe (${Object.keys(APG.TYPES).join(', ')})`);
      return;
    }
    for (const need of type.need) {
      const any = Array.isArray(need) ? need : [need];
      if (!any.some((f) => s[f] != null && s[f] !== '')) err(where, `falta ${any.join(' ou ')}`);
    }
    const known = new Set([...APG.COMMON_FIELDS, ...type.need.flat(), ...type.opt]);
    for (const f of Object.keys(s)) if (!known.has(f)) warn(where, `campo desconhecido "${f}" (será ignorado)`);

    if (s.steps != null) {
      const modes = APG.STEP_MODES[s.type];
      if (!modes) err(where, `o tipo ${s.type} não aceita steps`);
      else if (!modes.includes(s.steps)) err(where, `steps "${s.steps}" inválido (${modes.join(', ')})`);
    }
    if (s.notes != null && typeof s.notes !== 'string' && !(Array.isArray(s.notes) && s.notes.every((n) => typeof n === 'string'))) {
      err(where, 'notes precisa ser texto ou lista de textos (um por passo)');
    }
    for (const r of s.refs || []) if (!APG.ref(r)) err(where, `refs: "${r}" não está em data/refs.js`);

    let ref = null;
    if (s.ref) {
      ref = APG.ref(s.ref);
      if (!ref) err(where, `ref "${s.ref}" não está em data/refs.js (rode node scripts/sync-refs.mjs)`);
    }

    switch (s.type) {
      case 'title':
        imageOk(where, s.image, def);
        break;
      case 'verse':
        if (ref && ref.source !== 'Bíblia') warn(where, `ref "${s.ref}" é de ${ref.source}; para não bíblicas use o tipo quote`);
        if (ref || s.text) checkHighlights(where, s, textOf(s, ref, lang));
        break;
      case 'word':
        if (s.ref && ref && !ref.originalLanguage && !s.word) err(where, `ref "${s.ref}" não tem originalLanguage; informe word, transliteration e meaning`);
        break;
      case 'quote':
        if (ref || s.text) checkHighlights(where, s, textOf(s, ref, lang));
        break;
      case 'points':
      case 'questions':
        checkItems(where, s.items);
        break;
      case 'compare':
        for (const side of ['left', 'right']) {
          if (s[side]) checkItems(where, s[side].items, `${side}.items`);
        }
        break;
      case 'timeline':
        checkItems(where, (s.events || []).map((e) => ({ ...e, text: e && e.label })), 'events');
        (s.events || []).forEach((e, k) => { if (!e || e.year == null) err(where, `events[${k}] sem year`); });
        if ((s.events || []).length > 7) warn(where, `${s.events.length} marcos numa linha do tempo ficam apertados (até 7)`);
        break;
      case 'image':
        imageOk(where, s.image, def);
        if (s.fit && !['frame', 'full'].includes(s.fit)) err(where, `fit "${s.fit}" inválido (frame ou full)`);
        break;
      case 'stat':
        if (typeof s.value !== 'number') err(where, 'value precisa ser número (use prefix/suffix para o resto)');
        if (s.from != null && typeof s.from !== 'number') err(where, 'from precisa ser número');
        break;
      default:
        break;
    }
  });
}

for (const w of warnings) console.warn(`aviso: ${w}`);
for (const e of errors) console.error(`erro: ${e}`);
const summary = `${ids.length} deck(s), ${slideTotal} slides, ${errors.length} erro(s), ${warnings.length} aviso(s).`;
if (errors.length) {
  console.error(summary);
  process.exit(1);
}
console.log(summary);
