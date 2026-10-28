/* Player do deck (deck.html?d=<id>): palco fixo de 1920x1080 escalado para a
   janela com tarja (letterbox), navegação por passos, hash #/slide/passo,
   teclado, clique, visão geral, modo gravação e tela escura. Com
   &view=presenter a mesma página vira a janela do apresentador. */
(function () {
  'use strict';
  const APG = window.APG;
  const params = new URLSearchParams(location.search);
  const deckId = params.get('d') || 'demo';
  const $ = (id) => document.getElementById(id);

  const TYPE_NAMES = {
    title: 'Título', hook: 'Objeção', verse: 'Versículo', word: 'Palavra original', quote: 'Citação',
    points: 'Pontos', compare: 'Comparação', timeline: 'Linha do tempo', image: 'Imagem', stat: 'Número',
    questions: 'Perguntas', sources: 'Fontes',
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(src));
      document.head.appendChild(s);
    });
  }

  function fail(title, detail) {
    document.documentElement.dataset.theme = 'classica';
    document.body.className = 'apg-fail-page';
    document.body.innerHTML = '<main class="apg-fail apg-ui"><h1></h1><p></p><a href="index.html">Voltar para a galeria</a></main>';
    document.querySelector('.apg-fail h1').textContent = title;
    document.querySelector('.apg-fail p').textContent = detail;
  }

  async function boot() {
    if (!/^[a-z0-9][a-z0-9-]*$/i.test(deckId)) return fail('Deck inválido', `"${deckId}" não é um id de deck.`);
    try {
      await loadScript(`decks/${deckId}.js`);
    } catch (e) {
      return fail('Deck não encontrado', `Não consegui carregar decks/${deckId}.js. Confira o nome do arquivo e decks/index.js.`);
    }
    const def = APG.decks[deckId];
    if (!def || !Array.isArray(def.slides) || !def.slides.length) {
      return fail('Deck vazio', `decks/${deckId}.js precisa chamar deck({ id: '${deckId}', slides: [...] }).`);
    }
    APG.prefs.load();
    try {
      await document.fonts.load('600 80px "Cormorant Garamond"');
    } catch (e) {
      /* segue com a fonte de recuo */
    }
    if (params.get('view') === 'presenter') APG.presenter.start(def);
    else startPlayer(def);
  }

  function startPlayer(def) {
    document.title = def.title;
    const html = document.documentElement;
    const viewport = $('viewport');
    const stage = $('stage');
    const slidesEl = $('slides');
    const hud = $('hud');
    const handle = $('handle');
    const progressWrap = $('progress');
    const progressBar = progressWrap.firstElementChild;
    const P = (APG.player = {
      def, index: 0, step: 0, maxStep: 0, current: null, n: def.slides.length, blank: false, recording: false,
    });
    const link = APG.link(def.id, onMessage);

    // ---------- Palco escalado ----------

    function fitStage() {
      const w = viewport.clientWidth;
      const h = viewport.clientHeight;
      const k = Math.min(w / 1920, h / 1080);
      P.scale = k;
      stage.style.transform = `translate(${(w - 1920 * k) / 2}px, ${(h - 1080 * k) / 2}px) scale(${k})`;
    }
    if (typeof ResizeObserver === 'function') new ResizeObserver(fitStage).observe(viewport);
    else window.addEventListener('resize', fitStage);
    fitStage();

    // ---------- Preferências ----------

    function applyPrefs(patch) {
      const d = APG.prefs.data;
      html.dataset.theme = APG.prefs.theme(def);
      html.dataset.font = d.font;
      html.style.setProperty('--ts', d.textScale);
      APG.render.textScale = d.textScale;
      APG.anim.configure({ speed: d.speed, reduced: APG.prefs.reducedMotion() });
      html.classList.toggle('is-reduced', APG.prefs.reducedMotion());
      handle.querySelector('span').textContent = d.handle;
      handle.hidden = !d.handleShow || !d.handle;
      handle.dataset.corner = d.handleCorner;
      progressWrap.hidden = !d.progress;
      const relayout = !patch || ['all', 'themes', 'font', 'textScale'].some((k) => k in patch);
      if (relayout && P.current) mount(P.index, P.step, false);
      else broadcast();
    }
    APG.prefs.onChange(applyPrefs);
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => applyPrefs({ motion: true }));
    applyPrefs({ init: true });

    // ---------- Montagem e navegação ----------

    function mount(i, step, animate) {
      const old = P.current;
      const el = APG.render.slide(def, i);
      slidesEl.append(el);
      APG.render.fit(el);
      P.index = i;
      P.current = el;
      P.maxStep = APG.render.maxStep(el);
      P.step = Math.max(0, Math.min(step, P.maxStep));
      if (animate) {
        APG.anim.applyState(el, -1);
        APG.anim.playStep(el, 0, old ? 200 : 80);
      } else {
        APG.anim.applyState(el, P.step);
      }
      APG.anim.ambient(el);
      if (old) {
        if (animate) APG.anim.leave(old, 340);
        else {
          APG.anim.dispose(old);
          old.remove();
        }
      }
      changed();
    }

    function next() {
      if (P.blank) return setBlank(false);
      APG.anim.finish(P.current);
      if (P.step < P.maxStep) {
        P.step += 1;
        APG.anim.playStep(P.current, P.step);
        changed();
      } else if (P.index < P.n - 1) {
        mount(P.index + 1, 0, true);
      }
    }
    function prev() {
      if (P.blank) return setBlank(false);
      if (P.step > 0) {
        P.step -= 1;
        APG.anim.applyState(P.current, P.step);
        changed();
      } else if (P.index > 0) {
        mount(P.index - 1, Infinity, false);
      }
    }
    const first = () => mount(0, 0, true);
    const last = () => mount(P.n - 1, Infinity, false);
    const replay = () => mount(P.index, 0, true);
    const goTo = (i, step = 0) => {
      const idx = Math.max(0, Math.min(P.n - 1, i));
      mount(idx, step, step === 0);
    };

    function changed() {
      const hash = `#/${P.index + 1}/${P.step}`;
      if (location.hash !== hash) history.replaceState(null, '', hash);
      progressBar.style.transform = `scaleX(${(P.index + (P.step + 1) / (P.maxStep + 1)) / P.n})`;
      renderHud();
      broadcast();
    }

    // ---------- Hash ----------

    const parseHash = () => {
      const m = location.hash.match(/^#\/?(\d+)(?:\/(\d+))?$/);
      return m ? { i: Number(m[1]) - 1, s: Number(m[2] || 0) } : null;
    };
    window.addEventListener('hashchange', () => {
      const h = parseHash();
      if (h && (h.i !== P.index || h.s !== P.step)) goTo(h.i, h.s);
    });

    // ---------- Apresentador ----------

    function broadcast() {
      link.send('state', {
        index: P.index, step: P.step, maxStep: P.maxStep, n: P.n, blank: P.blank,
        theme: html.dataset.theme, font: html.dataset.font, textScale: APG.render.textScale,
      });
    }
    function onMessage(m) {
      if (m.type === 'hello') broadcast();
      if (m.type !== 'cmd') return;
      const cmds = { next, prev, first, last, replay, blank: toggleBlank };
      if (m.cmd === 'goto') goTo(m.index, m.step || 0);
      else if (cmds[m.cmd]) cmds[m.cmd]();
    }
    function openPresenter() {
      const url = `${location.pathname}?d=${encodeURIComponent(def.id)}&view=presenter`;
      const w = window.open(url, `apg-presenter-${def.id}`, 'popup=yes,width=1280,height=820');
      if (w) link.addPeer(w);
      else toast('O navegador bloqueou a janela do apresentador. Permita pop-ups para esta página.');
    }

    // ---------- Tela escura, gravação, tela cheia, tema ----------

    function setBlank(on) {
      P.blank = on;
      stage.classList.toggle('is-blank', on);
      renderHud();
      broadcast();
    }
    const toggleBlank = () => setBlank(!P.blank);

    let cursorTimer = 0;
    function toggleRecording() {
      P.recording = !P.recording;
      document.body.classList.toggle('is-recording', P.recording);
      closeOverlays();
      if (P.recording) {
        hud.classList.remove('is-on');
        document.body.classList.add('cursor-off');
      } else {
        document.body.classList.remove('cursor-off');
        toast('Modo gravação desligado');
      }
    }
    window.addEventListener('mousemove', () => {
      document.body.classList.remove('cursor-off');
      clearTimeout(cursorTimer);
      if (P.recording) cursorTimer = setTimeout(() => document.body.classList.add('cursor-off'), 1200);
      else pokeHud();
    });

    function toggleFullscreen() {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else document.documentElement.requestFullscreen().catch(() => toast('O navegador não deixou abrir em tela cheia.'));
    }

    function cycleTheme() {
      const list = APG.THEMES;
      const nextTheme = list[(list.indexOf(APG.prefs.theme(def)) + 1) % list.length];
      APG.prefs.setTheme(def, nextTheme);
      toast(`Tema: ${APG.THEME_NAMES[nextTheme]}`);
    }

    // ---------- HUD, avisos e ajuda ----------

    let hudTimer = 0;
    let digits = '';
    let digitsTimer = 0;
    function renderHud() {
      const pips = P.maxStep
        ? `<span class="hud-pips">${Array.from({ length: P.maxStep + 1 }, (_, i) => `<i class="${i <= P.step ? 'on' : ''}"></i>`).join('')}</span>`
        : '';
      hud.innerHTML = `<b>${P.index + 1}</b><span class="hud-of">de ${P.n}</span>${pips}`
        + `<span class="hud-hint">${digits ? `Ir para o slide ${digits}, Enter` : P.blank ? 'Tela escura: B volta' : '? atalhos'}</span>`;
    }
    function pokeHud() {
      if (P.recording) return;
      hud.classList.add('is-on');
      clearTimeout(hudTimer);
      hudTimer = setTimeout(() => hud.classList.remove('is-on'), 2200);
    }

    let toastEl = null;
    let toastTimer = 0;
    function toast(msg) {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'apg-toast apg-ui';
        toastEl.setAttribute('role', 'status');
        document.body.append(toastEl);
      }
      toastEl.textContent = msg;
      toastEl.classList.add('is-on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 1800);
    }

    const HELP = [
      ['→  Espaço  PageDown  clique', 'Próximo passo'],
      ['←  PageUp', 'Passo anterior'],
      ['Home  End', 'Primeiro e último slide'],
      ['número + Enter', 'Ir para um slide'],
      ['R', 'Repetir o slide desde o começo'],
      ['F', 'Tela cheia'],
      ['H', 'Modo gravação: esconde a interface e o cursor'],
      ['B  .', 'Tela escura'],
      ['O', 'Visão geral dos slides'],
      ['P', 'Janela do apresentador'],
      ['C', 'Personalizar'],
      ['T', 'Alternar o tema'],
      ['?  Esc', 'Mostrar e fechar esta ajuda'],
    ];
    let help = null;
    function toggleHelp() {
      if (help) return closeHelp();
      closeOverlays();
      help = document.createElement('div');
      help.className = 'apg-help apg-ui';
      help.setAttribute('role', 'dialog');
      help.setAttribute('aria-label', 'Atalhos');
      help.innerHTML = `<div class="help-card"><h2>Atalhos</h2><dl>${HELP.map(([k, v]) => `<dt>${k.split('  ').map((x) => `<kbd>${x}</kbd>`).join(' ')}</dt><dd>${v}</dd>`).join('')}</dl></div>`;
      help.addEventListener('click', closeHelp);
      document.body.append(help);
    }
    function closeHelp() {
      if (help) help.remove();
      help = null;
    }

    // ---------- Visão geral ----------

    let ov = null;
    function openOverview() {
      closeOverlays();
      ov = document.createElement('div');
      ov.className = 'apg-ov apg-ui';
      ov.setAttribute('role', 'dialog');
      ov.setAttribute('aria-label', 'Visão geral dos slides');
      const head = document.createElement('header');
      head.className = 'ov-head';
      head.innerHTML = '<h2></h2><p>Setas escolhem, Enter ou clique vai até o slide. O ou Esc fecha.</p>';
      head.querySelector('h2').textContent = def.title;
      const grid = document.createElement('div');
      grid.className = 'ov-grid';
      def.slides.forEach((s, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `ov-item${i === P.index ? ' is-current' : ''}`;
        b.dataset.i = i;
        b.innerHTML = '<div class="ov-thumb"></div><span class="ov-num"></span><span class="ov-type"></span>';
        b.querySelector('.ov-num').textContent = i + 1;
        b.querySelector('.ov-type').textContent = TYPE_NAMES[s.type] || s.type;
        b.addEventListener('click', () => {
          closeOverview();
          goTo(i, 0);
        });
        grid.append(b);
      });
      ov.append(head, grid);
      document.body.append(ov);
      grid.querySelectorAll('.ov-thumb').forEach((holder, i) => APG.render.mountStatic(holder, def, i, 'last'));
      const cur = grid.children[P.index];
      cur.focus({ preventScroll: true });
      cur.scrollIntoView({ block: 'center' });
    }
    function closeOverview() {
      if (!ov) return;
      ov.remove();
      ov = null;
    }
    function overviewKey(e) {
      const items = [...ov.querySelectorAll('.ov-item')];
      const at = Math.max(0, items.indexOf(document.activeElement));
      const cols = getComputedStyle(ov.querySelector('.ov-grid')).gridTemplateColumns.split(' ').length;
      const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
      if (moves[e.key] != null) {
        e.preventDefault();
        const to = items[Math.max(0, Math.min(items.length - 1, at + moves[e.key]))];
        to.focus();
        to.scrollIntoView({ block: 'nearest' });
        return true;
      }
      if (e.key === 'Escape' || e.key.toLowerCase() === 'o') {
        e.preventDefault();
        closeOverview();
        return true;
      }
      return e.key === 'Enter' || e.key === ' ';
    }

    function closeOverlays() {
      closeOverview();
      closeHelp();
      APG.customize.close();
    }

    // ---------- Teclado e clique ----------

    const KEYS = {
      ArrowRight: next, ' ': next, PageDown: next, ArrowDown: next,
      ArrowLeft: prev, PageUp: prev, ArrowUp: prev, Backspace: prev,
      Home: first, End: last,
      f: toggleFullscreen, h: toggleRecording, o: openOverview, p: openPresenter,
      c: () => { closeOverview(); closeHelp(); APG.customize.toggle(def); },
      t: cycleTheme, b: toggleBlank, '.': toggleBlank, r: replay, '?': toggleHelp,
      Escape: closeOverlays,
    };

    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (ov && overviewKey(e)) return;
      if (t && t.closest && t.closest('.apg-ui') && (e.key === ' ' || e.key === 'Enter')) return;
      if (help && (e.key === 'Escape' || e.key === '?')) {
        e.preventDefault();
        return closeHelp();
      }
      if (/^[0-9]$/.test(e.key)) {
        digits = (digits + e.key).slice(-3);
        clearTimeout(digitsTimer);
        digitsTimer = setTimeout(() => { digits = ''; renderHud(); }, 2500);
        renderHud();
        pokeHud();
        return;
      }
      if (e.key === 'Enter' && digits) {
        e.preventDefault();
        const n = Number(digits);
        digits = '';
        if (n >= 1) goTo(n - 1, 0);
        return;
      }
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const fn = KEYS[key] || (e.key === 'Enter' ? next : null);
      if (!fn) return;
      e.preventDefault();
      fn();
      if (fn === next || fn === prev) pokeHud();
    });

    viewport.addEventListener('click', (e) => {
      if (e.button !== 0) return;
      if (ov || help) return;
      if (APG.customize.isOpen()) {
        APG.customize.close();
        return;
      }
      next();
    });

    // ---------- Início ----------

    const start = parseHash();
    if (start && start.i >= 0 && start.i < P.n) mount(start.i, start.s, start.s === 0);
    else mount(0, 0, true);
    pokeHud();
  }

  boot();
})();
