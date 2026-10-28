/* Preferências (tema por deck, fonte, tamanho do texto, velocidade, movimento,
   assinatura e barra de progresso) e o painel da tecla C. Tudo fica no
   localStorage do navegador; se ele não estiver disponível (janela anônima,
   dados bloqueados), o painel funciona só durante a sessão. */
(function () {
  'use strict';
  const APG = window.APG;
  const KEY = 'apg-apresentacoes:prefs';
  const DEFAULTS = {
    font: 'theme',
    textScale: 1,
    speed: 1,
    motion: 'auto',
    handle: '@RMovitz',
    handleShow: true,
    handleCorner: 'br',
    progress: true,
    themes: {},
  };

  const P = (APG.prefs = { data: { ...DEFAULTS, themes: {} } });
  const listeners = [];

  P.load = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        P.data = { ...DEFAULTS, ...d, themes: { ...(d && d.themes) } };
      }
    } catch (e) {
      /* sem localStorage: fica com os padrões */
    }
    return P.data;
  };
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(P.data));
    } catch (e) {
      /* idem */
    }
  };
  const emit = (patch) => listeners.forEach((fn) => fn(patch));

  P.onChange = (fn) => listeners.push(fn);
  P.set = (patch) => {
    Object.assign(P.data, patch);
    save();
    emit(patch);
  };
  P.reset = () => {
    P.data = { ...DEFAULTS, themes: {} };
    save();
    emit({ all: true });
  };
  P.theme = (def) => {
    const t = P.data.themes[def.id] || def.theme;
    return APG.THEMES.includes(t) ? t : 'classica';
  };
  P.setTheme = (def, theme) => P.set({ themes: { ...P.data.themes, [def.id]: theme } });
  P.reducedMotion = () => P.data.motion === 'reduced'
    || (P.data.motion === 'auto' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---------- Painel ----------

  let panel = null;
  const C = (APG.customize = {});
  C.isOpen = () => !!(panel && !panel.hidden);

  const el = (tag, cls, attrs, kids) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
    for (const k of [].concat(kids || [])) n.append(k);
    return n;
  };

  // Grupo de opções exclusivas (rádios estilizados como segmentos).
  function segmented(name, options, get, set) {
    const wrap = el('div', 'seg', { role: 'radiogroup' });
    for (const [value, label] of options) {
      const id = `apg-${name}-${value}`;
      const input = el('input', null, { type: 'radio', name: `apg-${name}`, id, value });
      input.addEventListener('change', () => set(value));
      wrap.append(input, el('label', null, { for: id }, [label]));
    }
    wrap.sync = () => {
      for (const input of wrap.querySelectorAll('input')) input.checked = input.value === String(get());
    };
    return wrap;
  }

  function slider(name, min, max, stepV, get, set, fmt) {
    const out = el('output', 'pn-val');
    const input = el('input', null, { type: 'range', min, max, step: stepV, id: `apg-${name}` });
    input.addEventListener('input', () => {
      out.textContent = fmt(Number(input.value));
      set(Number(input.value));
    });
    const wrap = el('div', 'pn-slider', null, [input, out]);
    wrap.sync = () => {
      input.value = get();
      out.textContent = fmt(Number(get()));
    };
    return wrap;
  }

  function check(name, label, get, set) {
    const input = el('input', null, { type: 'checkbox', id: `apg-${name}` });
    input.addEventListener('change', () => set(input.checked));
    const wrap = el('label', 'pn-check', { for: `apg-${name}` }, [input, el('span', null, null, [label])]);
    wrap.sync = () => { input.checked = !!get(); };
    return wrap;
  }

  const row = (label, control, forId) => el('div', 'pn-row', null, [
    el(forId ? 'label' : 'p', 'pn-label', forId ? { for: forId } : null, [label]),
    control,
  ]);

  function build(def) {
    panel = el('aside', 'apg-panel apg-ui', { 'aria-label': 'Personalizar', tabindex: '-1' });
    panel.hidden = true;
    const d = () => P.data;

    const themes = el('div', 'pn-themes', { role: 'radiogroup', 'aria-label': 'Tema' });
    for (const t of APG.THEMES) {
      const b = el('button', 'pn-theme', { type: 'button', 'data-value': t, role: 'radio' }, [
        el('span', 'pn-swatch', { 'data-theme': t }, [el('i', null, null, [])]),
        el('span', null, null, [APG.THEME_NAMES[t]]),
      ]);
      b.addEventListener('click', () => P.setTheme(def, t));
      themes.append(b);
    }
    themes.sync = () => {
      const cur = P.theme(def);
      for (const b of themes.children) b.setAttribute('aria-checked', String(b.dataset.value === cur));
    };

    const controls = [
      themes,
      segmented('font', [['theme', 'Do tema'], ['cormorant', 'Cormorant'], ['serif', 'Serifa'], ['sans', 'Sans']], () => d().font, (v) => P.set({ font: v })),
      slider('scale', 0.8, 1.3, 0.05, () => d().textScale, (v) => P.set({ textScale: v }), (v) => `${Math.round(v * 100)}%`),
      slider('speed', 0.5, 2, 0.25, () => d().speed, (v) => P.set({ speed: v }), (v) => `${String(v).replace('.', ',')}×`),
      segmented('motion', [['auto', 'Do sistema'], ['full', 'Sempre animar'], ['reduced', 'Reduzido']], () => d().motion, (v) => P.set({ motion: v })),
    ];

    const handleInput = el('input', 'pn-text', { type: 'text', id: 'apg-handle', maxlength: '40', spellcheck: 'false', autocomplete: 'off' });
    handleInput.addEventListener('input', () => P.set({ handle: handleInput.value.trim() }));
    handleInput.sync = () => { if (document.activeElement !== handleInput) handleInput.value = d().handle; };
    const handleShow = check('handle-show', 'Mostrar no vídeo', () => d().handleShow, (v) => P.set({ handleShow: v }));
    const corner = segmented('corner', [['tl', '↖'], ['tr', '↗'], ['bl', '↙'], ['br', '↘']], () => d().handleCorner, (v) => P.set({ handleCorner: v }));
    corner.classList.add('seg--icons');
    const progress = check('progress', 'Barra de progresso no rodapé', () => d().progress, (v) => P.set({ progress: v }));
    controls.push(handleInput, handleShow, corner, progress);

    const close = el('button', 'pn-close', { type: 'button', 'aria-label': 'Fechar' }, ['×']);
    close.addEventListener('click', () => C.close());
    const reset = el('button', 'pn-reset', { type: 'button' }, ['Restaurar padrão']);
    reset.addEventListener('click', () => P.reset());

    panel.append(
      el('header', 'pn-head', null, [el('h2', null, null, ['Personalizar']), close]),
      row('Tema', themes),
      row('Fonte', controls[1]),
      row('Tamanho do texto', controls[2], 'apg-scale'),
      row('Velocidade das animações', controls[3], 'apg-speed'),
      row('Movimento', controls[4]),
      row('Assinatura', el('div', 'pn-stack', null, [handleInput, handleShow, corner]), 'apg-handle'),
      row('Rodapé', progress),
      el('p', 'pn-note', null, ['As escolhas ficam salvas neste navegador. O tema vale só para este deck; T alterna entre os quatro.']),
      reset,
    );
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        C.close();
      }
    });
    document.body.append(panel);
    panel.sync = () => controls.forEach((c) => c.sync && c.sync());
    P.onChange(() => panel.sync());
  }

  C.open = (def) => {
    if (!panel) build(def);
    panel.sync();
    panel.hidden = false;
    panel.focus();
  };
  C.close = () => {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    if (panel.contains(document.activeElement)) document.activeElement.blur();
  };
  C.toggle = (def) => (C.isOpen() ? C.close() : C.open(def));
})();
