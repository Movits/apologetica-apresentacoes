/* Tipos de slide -> DOM. Cada slide é um <section class="slide slide--tipo">
   de 1920x1080 com um .content por cima das camadas de fundo. Os elementos
   que animam recebem data-step / data-anim / data-at (ver engine/anim.js);
   blocos de texto que precisam caber recebem data-fit (ver R.fit). */
(function () {
  'use strict';
  const APG = window.APG;
  const R = (APG.render = {});

  // Multiplicadores ajustados pelo painel (tamanho do texto) e pela fonte
  // (fontes do sistema têm olho maior que a Cormorant).
  R.textScale = 1;

  const STR = {
    pt: {
      questions: 'Perguntas-chave',
      sources: 'Fontes',
      bible: 'Bíblia Ave Maria',
      left: 'A objeção',
      right: 'A resposta',
      strongs: 'Strong',
      article: 'Artigo completo no app APPologética',
      missingRef: (id) => `A referência "${id}" não está em data/refs.js. Rode node scripts/sync-refs.mjs.`,
      missingImage: 'Imagem não encontrada',
      groups: {
        'Bíblia': 'Sagrada Escritura',
        Catecismo: 'Catecismo',
        Documentos: 'Documentos da Igreja',
        'Teólogos': 'Padres, teólogos e autores',
        'Ciência': 'Ciência',
        'Mídia': 'Fotos e vídeos',
        Outros: 'Outras fontes',
      },
      extra: 'Outras fontes',
    },
    en: {
      questions: 'Key questions',
      sources: 'Sources',
      bible: 'Douay-Rheims',
      left: 'The objection',
      right: 'The answer',
      strongs: 'Strong',
      article: 'Full article in the APPologética app',
      missingRef: (id) => `Reference "${id}" is not in data/refs.js. Run node scripts/sync-refs.mjs.`,
      missingImage: 'Image not found',
      groups: {
        'Bíblia': 'Scripture',
        Catecismo: 'Catechism',
        Documentos: 'Church documents',
        'Teólogos': 'Fathers, theologians and authors',
        'Ciência': 'Science',
        'Mídia': 'Photos and video',
        Outros: 'Other sources',
      },
      extra: 'Other sources',
    },
  };
  const GROUP_ORDER = ['Bíblia', 'Catecismo', 'Documentos', 'Teólogos', 'Ciência', 'Mídia', 'Outros'];

  // ---------- Helpers de DOM ----------

  function h(tag, cls, kids, attrs) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v != null && v !== false) el.setAttribute(k, v === true ? '' : String(v));
      }
    }
    for (const k of [].concat(kids == null ? [] : kids)) {
      if (k != null && k !== false && k !== '') el.append(k instanceof Node ? k : String(k));
    }
    return el;
  }
  // Atributos de animação.
  const an = (step, anim, at) => ({ 'data-step': step, 'data-anim': anim, 'data-at': at });
  const fitAttrs = (max, min, extra) => ({ 'data-fit': true, 'data-fit-max': max, 'data-fit-min': min, ...extra });

  const CROSS = 'M7 0h4v9h7v4h-7v15H7V13H0V9h7z';
  function mark(cls) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 18 28');
    svg.setAttribute('class', cls);
    svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', CROSS);
    svg.appendChild(p);
    return svg;
  }
  R.mark = mark;

  const display = (t) => APG.smartQuotes(String(t == null ? '' : t));

  // Texto quebrado em palavras (.w) para animar uma a uma, com os destaques
  // embrulhados em .hl (um por frase de `hl`, cada um com seu passo).
  function textBlock(tag, cls, text, o) {
    const el = h(tag, cls, null, { 'data-step': o.step, 'data-anim': o.anim || 'words', 'data-at': o.at, ...(o.attrs || {}) });
    const words = APG.words(text);
    const marks = new Array(words.length).fill(-1);
    const taken = new Set();
    (o.hl || []).forEach((phrase, gi) => {
      const hit = APG.findPhrase(words, phrase, taken);
      if (!hit) {
        console.warn(`[apresentações] destaque "${phrase}" não aparece no texto`);
        return;
      }
      for (let i = hit[0]; i < hit[1]; i++) {
        marks[i] = gi;
        taken.add(i);
      }
    });
    // Nas palavras destacadas, a pontuação colada fica num .wp à parte para o
    // sublinhado e a cor não passarem por ela ("Pedro," sublinha só Pedro).
    const word = (w, inHl) => {
      const m = inHl && w.match(/^([“‘"'(\[]*)(.*?)([,.;:!?”’"')\]]*)$/u);
      const s = m && (m[1] || m[3]) && m[2]
        ? h('span', 'w', [m[1] ? h('span', 'wp', m[1]) : null, m[2], m[3] ? h('span', 'wp', m[3]) : null])
        : h('span', 'w', w);
      return o.anim === 'rise' ? h('span', 'wm', s) : s;
    };
    let i = 0;
    while (i < words.length) {
      if (marks[i] >= 0) {
        const gi = marks[i];
        const span = h('span', 'hl', null, { 'data-step': o.hlStep(gi), 'data-anim': 'underline', 'data-at': o.hlAt(gi) });
        while (i < words.length && marks[i] === gi) {
          span.append(word(words[i], true));
          if (i + 1 < words.length && marks[i + 1] === gi) span.append(' ');
          i++;
        }
        el.append(span);
      } else {
        el.append(word(words[i]));
        i++;
      }
      if (i < words.length) el.append(' ');
    }
    if (/^[“‘"']/.test(text)) el.classList.add('hang');
    if (o.fit) Object.assign(el.dataset, { fit: '', fitMax: o.fit[0], fitMin: o.fit[1] });
    return el;
  }

  // Passos dos destaques: 'highlight' (todos num passo depois do texto),
  // 'each' (um passo por destaque) ou 'with' (junto com o texto).
  function hlPlan(mode, textStep) {
    if (mode === 'each') return { hlStep: (g) => textStep + 1 + g, hlAt: () => '0' };
    if (mode === 'with') return { hlStep: () => textStep, hlAt: (g) => (g === 0 ? '+150' : '+60') };
    return { hlStep: () => textStep + 1, hlAt: (g) => (g === 0 ? '0' : '+60') };
  }

  const slideEl = (type) => h('section', `slide slide--${type}`, null, { 'data-type': type });
  const content = (...kids) => h('div', 'content', kids);

  function errorSlide(msg) {
    const el = slideEl('error');
    el.append(content(h('p', 'error-msg', msg)));
    return el;
  }

  function imageEl(src, cls, alt, ambient) {
    // decoding sync: a obra já entra pintada, sem um quadro vazio na troca.
    const img = h('img', cls, null, { src, alt: alt || '', draggable: 'false', decoding: 'sync', 'data-ambient': ambient || null });
    img.addEventListener('error', () => {
      img.replaceWith(h('div', `${cls} img-missing`, `${STR.pt.missingImage}: ${src}`));
    }, { once: true });
    return img;
  }

  const itemText = (it) => (typeof it === 'string' ? it : (it && it.text) || '');
  function itemSub(it, c) {
    if (!it || typeof it !== 'object') return '';
    if (it.sub) return it.sub;
    const ref = APG.ref(it.ref);
    return ref ? APG.refField(ref, 'ref', c.lang) : '';
  }

  // ---------- Tipos ----------

  const TYPES = {};

  TYPES.title = (s, c) => {
    const el = slideEl('title');
    const img = APG.resolveImage(s.image, c.def);
    if (img) {
      el.classList.add('has-art');
      el.append(
        h('div', 'art', imageEl(img.src, 'art-img', s.alt || img.alt, 'kenburns'), an(0, 'fadein', '0')),
        h('div', 'scrim'),
      );
    } else {
      el.append(mark('title-mark'));
    }
    const box = h('div', 'title-box');
    if (s.kicker) box.append(h('p', 'kicker', display(s.kicker), an(0, 'fade', '0')));
    const fitBox = h('div', 'title-fit');
    fitBox.append(textBlock('h1', 'title-text', display(s.title), {
      step: 0, anim: 'rise', at: s.kicker ? '180' : '60', fit: [176, 72],
    }));
    box.append(fitBox);
    if (s.subtitle) box.append(h('p', 'subtitle', display(s.subtitle), an(0, 'fade', '+-640')));
    const credit = s.credit != null ? s.credit : img && img.credit;
    el.append(content(box, credit ? h('p', 'credit', display(credit), an(0, 'fadein', '+-200')) : null));
    return el;
  };

  TYPES.hook = (s, c) => {
    const el = slideEl('hook');
    const body = h('div', 'hook-body');
    const text = textBlock('p', 'hook-text', display(APG.unwrapQuotes(s.text)), { step: 0, at: '200', fit: [108, 54] });
    // Aspa de abertura em ouro, pendurada na margem.
    text.prepend(h('span', 'hook-q', '“', { 'aria-hidden': 'true', ...an(0, 'fadein', '0') }));
    body.append(text);
    el.append(content(
      s.who ? h('p', 'label', display(s.who), an(0, 'fade', '0')) : null,
      body,
      s.attribution ? h('p', 'hook-attr', display(s.attribution), an(0, 'fade', '+-200')) : null,
    ));
    return el;
  };

  TYPES.verse = (s, c) => {
    const ref = APG.ref(s.ref);
    if (!ref && !s.text) return errorSlide(c.t.missingRef(s.ref));
    let text = s.text || APG.refField(ref, 'text', c.lang);
    if (s.tidyQuotes !== false) text = APG.balanceQuotes(display(text));
    const el = slideEl('verse');
    const tr = s.translation !== undefined ? s.translation
      : c.def.translation !== undefined ? c.def.translation
        : ref && ref.source === 'Bíblia' ? c.t.bible : '';
    const badge = h('div', 'badge', [
      mark('badge-mark'),
      h('span', 'badge-ref', display(s.refLabel || APG.refField(ref, 'ref', c.lang) || '')),
      tr ? h('span', 'badge-tr', tr) : null,
    ], an(0, 'fade', '0'));
    const body = h('div', 'verse-body');
    body.append(textBlock('p', 'verse-text', text, {
      step: 0, at: '220', fit: [82, 40], hl: APG.highlightList(s.highlight), ...hlPlan(s.steps, 0),
    }));
    el.append(content(badge, body));
    return el;
  };

  TYPES.word = (s, c) => {
    const ref = s.ref ? APG.ref(s.ref) : null;
    if (s.ref && !ref && !s.word) return errorSlide(c.t.missingRef(s.ref));
    const ol = (ref && ref.originalLanguage) || {};
    const word = s.word || ol.word || '';
    const translit = s.transliteration || ol.transliteration;
    const strongs = s.strongs || ol.strongs;
    const language = s.language || ol.language;
    const meaning = s.meaning || (c.lang === 'en' && ref && ref.en && ref.en.meaning) || ol.meaning;
    const together = s.steps === 'together';
    const st = (n) => (together ? 0 : n);

    const el = slideEl('word');
    const orig = h('p', 'word-orig', null, { lang: language && /grego|greek/i.test(language) ? 'grc' : language && /hebr/i.test(language) ? 'he' : null, ...an(0, 'zoom', language ? '+-500' : '120'), ...fitAttrs(230, 90) });
    word.split(/\s+\/\s+/).forEach((part, i) => {
      // Espaço rígido antes da barra: a quebra de linha fica depois dela.
      if (i) orig.append(' ', h('span', 'sep', '/'), ' ');
      orig.append(part);
    });
    const left = h('div', 'word-left', [
      language ? h('p', 'label', language, an(0, 'fade', '0')) : null,
      h('div', 'word-orig-box', orig),
      translit ? h('p', 'word-translit', translit, an(st(1), 'fade', together ? '+-500' : '0')) : null,
      strongs ? h('p', 'word-strongs', `${c.t.strongs} ${strongs}`, an(st(1), 'fade', '+-560')) : null,
    ]);
    const kids = [left];
    if (meaning) {
      const refName = ref ? APG.refField(ref, 'ref', c.lang) : '';
      kids.push(
        h('div', 'word-rule', null, an(st(2), 'drawy', together ? '+-300' : '0')),
        h('div', 'word-right', [
          refName ? h('p', 'word-ref', display(refName), an(st(2), 'fade', '+-700')) : null,
          h('div', 'word-meaning-box', h('p', 'word-meaning', display(meaning), { ...an(st(2), 'fade', '+-560'), ...fitAttrs(40, 24) })),
        ]),
      );
    } else {
      el.classList.add('is-solo');
    }
    el.append(content(...kids));
    return el;
  };

  TYPES.quote = (s, c) => {
    const ref = s.ref ? APG.ref(s.ref) : null;
    if (s.ref && !ref && !s.text) return errorSlide(c.t.missingRef(s.ref));
    const text = APG.balanceQuotes(display(APG.unwrapQuotes(s.text || APG.refField(ref, 'text', c.lang))));
    const auto = APG.splitAuthor(APG.refField(ref, 'author', c.lang));
    const name = s.author || auto.name;
    const note = s.note !== undefined ? s.note : s.author ? '' : auto.note;
    const work = s.work !== undefined ? s.work : APG.refField(ref, 'ref', c.lang);
    const year = s.year !== undefined ? s.year : APG.refField(ref, 'year', c.lang);
    const el = slideEl('quote');
    const body = h('div', 'quote-body');
    body.append(textBlock('p', 'quote-text', text, {
      step: 0, at: '160', fit: [74, 36], hl: APG.highlightList(s.highlight), ...hlPlan(s.steps, 0),
    }));
    const attr = h('div', 'quote-attr', [
      h('span', 'attr-rule'),
      name ? h('p', 'attr-name', display(name)) : null,
      note ? h('p', 'attr-note', display(note)) : null,
      work || year ? h('p', 'attr-work', display([work, year].filter(Boolean).join(', '))) : null,
    ], an(0, 'fade', '+-260'));
    el.append(content(h('div', 'quote-wrap', [h('div', 'qmark', '“', an(0, 'fadein', '0')), body, attr])));
    return el;
  };

  // Lista de itens, um por passo ('each') ou todos juntos ('together').
  function listItems(items, c, o) {
    const together = o.mode === 'together';
    return items.map((it, i) => {
      const sub = itemSub(it, c);
      const marker = o.numbered ? h('span', 'item-num', String(i + 1)) : o.marker ? h('span', o.marker) : null;
      return h('li', o.cls, [
        marker,
        h('div', 'item-body', [
          h('span', 'item-text', display(itemText(it))),
          sub ? h('span', 'item-sub', display(sub)) : null,
        ]),
      ], {
        ...an(together ? 0 : i + 1, 'fade', together ? (i === 0 ? '+-520' : '+-560') : '0'),
        'data-focus': o.focus && !together ? true : null,
      });
    });
  }

  const slideTitle = (text, step = 0) => textBlock('h2', 'slide-title', display(text), { step, anim: 'rise', at: '0' });

  TYPES.points = (s, c) => {
    const el = slideEl('points');
    const list = h('ul', 'list', listItems(s.items || [], c, {
      mode: s.steps, focus: s.focus === true, numbered: s.numbered, marker: 'item-mark', cls: 'item',
    }), fitAttrs(66, 30));
    el.append(content(s.title ? slideTitle(s.title) : null, h('div', 'list-box', list)));
    return el;
  };

  TYPES.questions = (s, c) => {
    const el = slideEl('questions');
    const list = h('ol', 'q-list', listItems(s.items || [], c, {
      mode: s.steps, focus: s.focus !== false, cls: 'q-item',
    }), fitAttrs(60, 30));
    el.append(content(slideTitle(s.title || c.t.questions), h('div', 'list-box', list)));
    return el;
  };

  TYPES.compare = (s, c) => {
    const el = slideEl('compare');
    const rightStep = s.steps === 'together' ? 0 : 1;
    const col = (side, def, step, fallback) => {
      const items = (def && def.items) || [];
      return h('div', `col col-${side}`, [
        h('p', 'col-head', display((def && def.title) || fallback), an(step, 'fade', step === 0 ? (side === 'left' ? (s.title ? '+-700' : '0') : '+-200') : '0')),
        h('div', 'col-box', h('ul', 'col-items', items.map((it) => {
          const sub = itemSub(it, c);
          return h('li', null, [
            h('span', 'item-text', display(itemText(it))),
            sub ? h('span', 'item-sub', display(sub)) : null,
          ], an(step, 'fade', '+-520'));
        }), fitAttrs(50, 28, { 'data-fit-group': 'cmp' }))),
      ]);
    };
    const grid = h('div', 'cmp', [
      col('left', s.left, 0, c.t.left),
      h('div', 'cmp-rule', null, an(0, 'drawy', s.title ? '300' : '0')),
      col('right', s.right, rightStep, c.t.right),
    ]);
    el.append(content(s.title ? slideTitle(s.title) : null, grid));
    return el;
  };

  TYPES.timeline = (s, c) => {
    const el = slideEl('timeline');
    const events = s.events || [];
    const together = s.steps === 'together';
    const n = Math.max(events.length, 1);
    const W = 1584;
    const xs = events.map((_, i) => ((i + 0.5) * W) / n);
    const tl = h('div', 'tl', [h('div', 'tl-axis', null, an(0, 'drawx', s.title ? '+-700' : '0'))]);
    events.forEach((ev, i) => {
      const step = together ? 0 : i + 1;
      const x0 = i === 0 ? 0 : xs[i - 1];
      const sub = itemSub(ev, c);
      tl.append(
        h('div', 'tl-seg', null, { ...an(step, 'drawx', together ? '+-500' : '0'), style: `left:${x0}px;width:${xs[i] - x0}px` }),
        h('div', 'tl-dot', null, { ...an(step, 'pop', '+-260'), style: `left:${xs[i]}px` }),
        h('div', 'tl-ev', [
          h('p', 'tl-year', display(ev.year)),
          h('div', 'tl-text', [
            h('p', 'tl-label', display(ev.label || ev.text || '')),
            sub ? h('p', 'tl-sub', display(sub)) : null,
          ]),
        ], { ...an(step, 'fade', '+-380'), style: `left:${xs[i]}px;width:${Math.min(360, W / n - 24)}px` }),
      );
    });
    el.append(content(s.title ? slideTitle(s.title) : null, h('div', 'tl-box', tl)));
    return el;
  };

  TYPES.image = (s, c) => {
    const img = APG.resolveImage(s.image, c.def) || { src: '' };
    const credit = s.credit != null ? s.credit : img.credit;
    const el = slideEl('image');
    if (s.fit === 'full') {
      el.classList.add('has-art');
      el.append(
        h('div', 'art', imageEl(img.src, 'art-img', s.alt || img.alt, 'kenburns'), an(0, 'fadein', '0')),
        h('div', 'scrim scrim--bottom'),
      );
      el.append(content(h('div', 'figcap', [
        s.caption ? h('p', 'caption', display(s.caption), an(0, 'fade', '500')) : null,
        credit ? h('p', 'fig-credit', display(credit), an(0, 'fadein', '+-300')) : null,
      ])));
      return el;
    }
    el.append(content(h('figure', 'figure', [
      h('div', 'frame', imageEl(img.src, 'frame-img', s.alt || img.alt, 'kenburns-soft'), an(0, 'frame', '0')),
      h('figcaption', 'figcap', [
        s.caption ? h('p', 'caption', display(s.caption), an(0, 'fade', '+-620')) : null,
        credit ? h('p', 'fig-credit', display(credit), an(0, 'fadein', '+-400')) : null,
      ]),
    ])));
    return el;
  };

  TYPES.stat = (s, c) => {
    const el = slideEl('stat');
    const ref = s.ref ? APG.ref(s.ref) : null;
    const locale = c.lang === 'en' ? 'en-US' : 'pt-BR';
    const dec = Number(s.decimals) || 0;
    const fmt = APG.anim.numberFormat(locale, dec);
    const value = Number(s.value) || 0;
    const from = s.from != null ? Number(s.from) : 0;
    const source = s.source || (ref ? [APG.refField(ref, 'ref', c.lang), APG.splitAuthor(APG.refField(ref, 'author', c.lang)).name].filter(Boolean).join(', ') : '');
    const num = h('div', 'stat-num', [
      h('span', 'num-ghost', fmt(value), { 'aria-hidden': 'true' }),
      h('span', 'num-live', fmt(value)),
    ], { ...an(0, 'count', s.prefix ? '+-300' : '120'), 'data-from': from, 'data-to': value, 'data-decimals': dec, 'data-locale': locale });
    el.append(content(h('div', 'stat', [
      s.prefix ? h('p', 'stat-prefix', display(s.prefix), an(0, 'fade', '0')) : null,
      h('div', 'stat-row', [num, s.suffix ? h('span', 'stat-suffix', display(s.suffix), an(0, 'fade', '+-1500')) : null]),
      s.label ? h('p', 'stat-label', display(s.label), an(0, 'fade', '+-1400')) : null,
      source ? h('p', 'stat-source', display(source), an(0, 'fadein', '+-300')) : null,
    ])));
    return el;
  };

  const shortUrl = (u) => {
    const s = String(u).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    return s.length > 64 ? `${s.slice(0, 40)}…${s.slice(-20)}` : s;
  };

  TYPES.sources = (s, c) => {
    const el = slideEl('sources');
    const groups = new Map();
    for (const id of APG.collectRefIds(c.def)) {
      const ref = APG.ref(id);
      if (!ref) continue;
      const key = GROUP_ORDER.includes(ref.source) ? ref.source : 'Outros';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(ref);
    }
    const cols = h('div', 'src-cols', null, fitAttrs(28, 14, { 'data-fit-self': true }));
    let gi = 0;
    for (const key of GROUP_ORDER) {
      const refs = groups.get(key);
      if (!refs) continue;
      cols.append(h('section', 'src-group', [
        h('h3', 'src-head', c.t.groups[key] || key),
        h('ul', 'src-list', refs.map((ref) => {
          const meta = ref.source === 'Bíblia'
            ? (c.def.translation !== undefined ? c.def.translation : c.t.bible)
            : [APG.splitAuthor(APG.refField(ref, 'author', c.lang)).name, APG.refField(ref, 'year', c.lang)].filter(Boolean).join(', ');
          const url = APG.refField(ref, 'url', c.lang);
          return h('li', 'src-item', [
            h('p', 'src-ref', display(APG.refField(ref, 'ref', c.lang))),
            meta ? h('p', 'src-meta', display(meta)) : null,
            url ? h('p', 'src-url', shortUrl(url)) : null,
          ]);
        })),
      ], an(0, 'fade', gi++ === 0 ? '+-560' : '+-600')));
    }
    const extra = [].concat(s.extra || c.def.sources || []);
    if (extra.length) {
      cols.append(h('section', 'src-group', [
        h('h3', 'src-head', c.t.extra),
        h('ul', 'src-list', extra.map((x) => h('li', 'src-item', h('p', 'src-ref src-ref--plain', display(x))))),
      ], an(0, 'fade', '+-600')));
    }
    const art = c.def.article != null && APG.articles[c.def.article];
    el.append(content(
      slideTitle(s.title || c.t.sources),
      h('div', 'src-box', cols),
      art ? h('p', 'src-article', [mark('src-mark'), display(`${c.t.article}: ${art.title}`)], an(0, 'fadein', '+0')) : null,
    ));
    return el;
  };

  // ---------- API ----------

  R.strings = (lang) => STR[lang] || STR.pt;

  R.slide = (def, index) => {
    const s = def.slides[index];
    const lang = def.lang === 'en' ? 'en' : 'pt';
    const c = { def, lang, t: R.strings(lang), index };
    const make = TYPES[s && s.type];
    const el = make ? make(s, c) : errorSlide(`Tipo de slide desconhecido: ${s && s.type}`);
    el.dataset.index = index;
    return el;
  };

  R.maxStep = (slide) => {
    let m = 0;
    for (const el of slide.querySelectorAll('[data-step]')) m = Math.max(m, Number(el.dataset.step) || 0);
    return m;
  };

  // Ajusta o tamanho da fonte de cada [data-fit] ao espaço que ele tem: o
  // maior tamanho (até data-fit-max) que cabe sem estourar a caixa (o pai, ou
  // o próprio elemento com data-fit-self). Elementos com o mesmo
  // data-fit-group ficam todos com o menor tamanho do grupo.
  R.fit = (slide) => {
    const root = getComputedStyle(document.documentElement);
    const ds = parseFloat(root.getPropertyValue('--ds')) || 1;
    const groups = {};
    for (const el of slide.querySelectorAll('[data-fit]')) {
      const scale = R.textScale * ds;
      const max = Math.round(Number(el.dataset.fitMax) * scale);
      const min = Math.min(max, Math.round(Number(el.dataset.fitMin) * Math.min(scale, 1)));
      const self = el.hasAttribute('data-fit-self');
      const box = self ? el : el.parentElement;
      const fits = () => el.scrollWidth <= el.clientWidth + 1
        && (self ? el.scrollHeight <= el.clientHeight + 1 : el.offsetHeight <= box.clientHeight + 1);
      el.style.fontSize = `${max}px`;
      if (!fits()) {
        let lo = min;
        let hi = max - 1;
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2);
          el.style.fontSize = `${mid}px`;
          if (fits()) lo = mid;
          else hi = mid - 1;
        }
        el.style.fontSize = `${lo}px`;
      }
      const g = el.dataset.fitGroup;
      if (g) (groups[g] = groups[g] || []).push(el);
    }
    for (const els of Object.values(groups)) {
      const m = Math.min(...els.map((e) => parseFloat(e.style.fontSize)));
      els.forEach((e) => { e.style.fontSize = `${m}px`; });
    }
  };

  // Monta um slide parado (miniaturas, apresentador) dentro de `holder`, num
  // palco 1920x1080 escalado para a largura do holder. step 'last' = completo.
  R.mountStatic = (holder, def, index, step = 'last') => {
    holder.textContent = '';
    const canvas = h('div', 'apg-canvas apg-mini');
    holder.append(canvas);
    const slide = R.slide(def, index);
    canvas.append(slide);
    R.fit(slide);
    const max = R.maxStep(slide);
    APG.anim.applyState(slide, step === 'last' ? max : Math.min(step, max));
    const rescale = () => {
      const c = holder.querySelector(':scope > .apg-canvas');
      if (c) c.style.transform = `scale(${holder.clientWidth / 1920})`;
    };
    rescale();
    // O holder pode mudar de largura depois (janela, grade, fonte): a escala
    // acompanha sem precisar montar o slide de novo.
    if (!holder.apgResize && typeof ResizeObserver === 'function') {
      holder.apgResize = new ResizeObserver(rescale);
      holder.apgResize.observe(holder);
    }
    return { canvas, slide, maxStep: max };
  };
})();
