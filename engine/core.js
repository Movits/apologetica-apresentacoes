/* Núcleo compartilhado: registro de decks, esquema dos tipos de slide e
   utilitários de texto. Roda no navegador e no Node (os scripts de checagem o
   carregam por vm), então não toca no DOM. */
(function (root) {
  'use strict';
  const APG = (root.APG = root.APG || {});
  APG.decks = APG.decks || {};
  // data/refs.js e data/articles.js (gerados) preenchem estes dois.
  APG.refs = APG.refs || {};
  APG.articles = APG.articles || {};

  // Cada arquivo em decks/ chama deck({...}) e se registra aqui.
  root.deck = function deck(def) {
    if (!def || typeof def.id !== 'string') throw new Error('deck() precisa de um id');
    APG.decks[def.id] = def;
    return def;
  };

  APG.THEMES = ['classica', 'pergaminho', 'vitral', 'minimal'];
  APG.THEME_NAMES = { classica: 'Clássica', pergaminho: 'Pergaminho', vitral: 'Vitral', minimal: 'Minimal' };

  // Tipos de slide. `need` são os campos obrigatórios (um array dentro de
  // `need` quer dizer "pelo menos um destes"); `opt` os opcionais. Campos fora
  // das duas listas viram aviso no check-decks, para pegar erro de digitação.
  APG.COMMON_FIELDS = ['type', 'notes', 'refs', 'steps'];
  APG.TYPES = {
    title: { need: ['title'], opt: ['kicker', 'subtitle', 'image', 'credit', 'alt'] },
    hook: { need: ['text'], opt: ['who', 'attribution'] },
    verse: { need: ['ref'], opt: ['text', 'refLabel', 'highlight', 'translation', 'tidyQuotes'] },
    word: {
      need: [['ref', 'word']],
      opt: ['ref', 'word', 'language', 'transliteration', 'strongs', 'meaning'],
    },
    quote: { need: [['ref', 'text']], opt: ['ref', 'text', 'author', 'note', 'work', 'year', 'highlight'] },
    points: { need: ['items'], opt: ['title', 'numbered', 'focus'] },
    compare: { need: ['left', 'right'], opt: ['title'] },
    timeline: { need: ['events'], opt: ['title'] },
    image: { need: ['image'], opt: ['credit', 'caption', 'alt', 'fit'] },
    stat: { need: ['value'], opt: ['from', 'prefix', 'suffix', 'label', 'source', 'ref', 'decimals'] },
    questions: { need: ['items'], opt: ['title', 'focus'] },
    sources: { need: [], opt: ['title', 'extra'] },
  };

  // Valores aceitos em `steps` por tipo (passos configuráveis). O primeiro é o
  // padrão.
  APG.STEP_MODES = {
    verse: ['highlight', 'each', 'with'],
    quote: ['highlight', 'each', 'with'],
    word: ['sequence', 'together'],
    points: ['each', 'together'],
    questions: ['each', 'together'],
    compare: ['columns', 'together'],
    timeline: ['each', 'together'],
  };

  // ---------- Texto ----------

  APG.words = (text) => String(text == null ? '' : text).trim().split(/\s+/).filter(Boolean);

  // Palavra sem pontuação e sem caixa, para comparar destaque com o texto.
  APG.norm = (w) => String(w).normalize('NFC').toLocaleLowerCase('pt-BR').replace(/[^\p{L}\p{N}]+/gu, '');

  // Índices [início, fim) da primeira ocorrência de `phrase` em `words` que não
  // encoste em palavras já usadas (`taken`, um Set de índices). Palavras que
  // são só pontuação ("/", "–") não contam na comparação.
  APG.findPhrase = (words, phrase, taken) => {
    const target = APG.words(phrase).map(APG.norm).filter(Boolean);
    if (!target.length) return null;
    const idx = [];
    words.forEach((w, i) => { if (APG.norm(w)) idx.push(i); });
    const normed = idx.map((i) => APG.norm(words[i]));
    outer: for (let k = 0; k + target.length <= normed.length; k++) {
      for (let j = 0; j < target.length; j++) {
        if (normed[k + j] !== target[j]) continue outer;
      }
      const start = idx[k];
      const end = idx[k + target.length - 1] + 1;
      if (taken) {
        let clash = false;
        for (let i = start; i < end; i++) if (taken.has(i)) clash = true;
        if (clash) continue;
      }
      return [start, end];
    }
    return null;
  };

  // Aspas retas viram tipográficas (“ ” e ’).
  APG.smartQuotes = (t) => String(t)
    .replace(/(^|[\s([{\u2014\u2013-])"/g, '$1“')
    .replace(/"/g, '”')
    .replace(/(\p{L})'(\p{L})/gu, '$1’$2');

  // Um trecho da Ave Maria pode começar no meio de uma fala ("...nos céus”.")
  // ou terminar antes dela fechar. No slide, a aspa que sobra é fechada ou
  // aberta na ponta, sem mexer no texto do meio.
  APG.balanceQuotes = (t) => {
    const s = String(t).trim();
    const open = (s.match(/“/g) || []).length;
    const close = (s.match(/”/g) || []).length;
    if (close > open) return '“' + s;
    if (open > close) return s + '”';
    return s;
  };

  // Citações que vêm inteiras entre aspas perdem as aspas de fora, porque o
  // slide já desenha a sua.
  APG.unwrapQuotes = (t) => {
    const s = String(t).trim();
    const m = s.match(/^[“"](.*)[”"]([.!?]?)$/s);
    if (!m || /[“”"]/.test(m[1])) return s;
    return m[1] + m[2];
  };

  // "Santo Inácio (discípulo de São João)" -> nome e nota separados.
  APG.splitAuthor = (a) => {
    const m = String(a || '').match(/^(.*?)\s*\((.*)\)\s*$/);
    return m ? { name: m[1], note: m[2] } : { name: String(a || ''), note: '' };
  };

  // ---------- Referências ----------

  APG.ref = (id) => (id && APG.refs[id]) || null;

  // Campos da referência no idioma do deck, com recuo para o português.
  APG.refField = (ref, field, lang) => {
    if (!ref) return '';
    if (lang === 'en' && ref.en && ref.en[field]) return ref.en[field];
    return ref[field] || '';
  };

  APG.highlightList = (h) => (h == null ? [] : Array.isArray(h) ? h : [h]);

  // Itens de lista aceitam texto ou { text, sub, ref }.
  APG.itemRefs = (items) => (items || []).map((it) => it && typeof it === 'object' && it.ref).filter(Boolean);

  // Ids de referência usados no deck, na ordem em que aparecem.
  APG.collectRefIds = (def) => {
    const out = [];
    const add = (id) => { if (typeof id === 'string' && id && !out.includes(id)) out.push(id); };
    for (const s of def.slides || []) {
      add(s.ref);
      (s.refs || []).forEach(add);
      APG.itemRefs(s.items).forEach(add);
      APG.itemRefs(s.events).forEach(add);
      if (s.left) APG.itemRefs(s.left.items).forEach(add);
      if (s.right) APG.itemRefs(s.right.items).forEach(add);
    }
    return out;
  };

  // Imagem de um slide: 'article' usa a obra do artigo do app ligado ao deck.
  APG.resolveImage = (spec, def) => {
    if (!spec) return null;
    if (spec === 'article') {
      const a = def && APG.articles[def.article];
      return a ? { src: a.image, credit: a.credit, alt: a.alt } : null;
    }
    return { src: spec, credit: '', alt: '' };
  };

  // Caminhos de imagem usados pelo deck (para checagem e para a cópia do app).
  APG.collectImages = (def) => {
    const out = [];
    const add = (spec) => {
      if (!spec || spec === 'article' || out.includes(spec)) return;
      out.push(spec);
    };
    add(def.cover);
    for (const s of def.slides || []) add(s.image);
    return out;
  };

  APG.cover = (def) => {
    if (def.cover) return def.cover;
    const withImage = (def.slides || []).find((s) => s.image);
    const img = withImage && APG.resolveImage(withImage.image, def);
    if (img) return img.src;
    const a = APG.articles[def.article];
    return a ? a.image : null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
