/* Janela do apresentador (deck.html?d=<id>&view=presenter): roteiro do slide
   atual, prévia do atual e do próximo, cronômetro e relógio. Conversa com a
   janela da apresentação por BroadcastChannel e, como reforço (aberto por
   file:// alguns navegadores isolam o canal), por postMessage entre a janela
   que abriu e a aberta. Mensagens repetidas pelos dois caminhos são
   descartadas pelo id. */
(function () {
  'use strict';
  const APG = window.APG;

  APG.link = (deckId, onMessage) => {
    const peers = new Set();
    const seen = [];
    const isNew = (uid) => {
      if (seen.includes(uid)) return false;
      seen.push(uid);
      if (seen.length > 200) seen.shift();
      return true;
    };
    const receive = (m, source) => {
      if (!m || m.apg !== deckId || !isNew(m.uid)) return;
      if (source && source !== window) peers.add(source);
      onMessage(m);
    };
    let bc = null;
    try {
      bc = new BroadcastChannel(`apg-deck-${deckId}`);
      bc.onmessage = (e) => receive(e.data);
    } catch (e) {
      bc = null;
    }
    window.addEventListener('message', (e) => receive(e.data, e.source));
    if (window.opener) peers.add(window.opener);

    const send = (type, data) => {
      const m = { apg: deckId, uid: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, type, ...data };
      isNew(m.uid);
      if (bc) bc.postMessage(m);
      for (const p of peers) {
        try {
          if (p.closed) peers.delete(p);
          else p.postMessage(m, '*');
        } catch (e) {
          peers.delete(p);
        }
      }
    };
    return { send, addPeer: (w) => w && peers.add(w) };
  };

  // ---------- Janela do apresentador ----------

  const pad = (n) => String(n).padStart(2, '0');
  const clock = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  };

  APG.presenter = {
    start(def) {
      document.title = `Apresentador: ${def.title}`;
      document.body.className = 'apg-presenter apg-ui';
      document.body.innerHTML = `
        <header class="pr-bar">
          <div class="pr-title"></div>
          <div class="pr-pos" aria-live="polite"></div>
          <div class="pr-timer">
            <span class="pr-elapsed">00:00:00</span>
            <button type="button" class="pr-btn" data-act="toggle">Iniciar</button>
            <button type="button" class="pr-btn" data-act="reset">Zerar</button>
          </div>
          <div class="pr-clock"></div>
        </header>
        <main class="pr-main">
          <section class="pr-previews">
            <p class="pr-cap">Agora</p>
            <div class="pr-now pr-thumb"></div>
            <p class="pr-cap pr-cap--next">Próximo slide</p>
            <div class="pr-next pr-thumb"></div>
          </section>
          <section class="pr-notes-wrap">
            <p class="pr-cap">Roteiro</p>
            <div class="pr-notes"></div>
          </section>
        </main>
        <footer class="pr-foot"></footer>`;
      const $ = (s) => document.querySelector(s);
      $('.pr-title').textContent = def.title;
      const foot = $('.pr-foot');
      const n = def.slides.length;
      let state = null;

      // Cronômetro: começa sozinho no primeiro avanço, ou pelo botão.
      let running = false;
      let base = 0;
      let since = 0;
      const elapsed = () => base + (running ? Date.now() - since : 0);
      const toggleBtn = $('[data-act="toggle"]');
      const setRunning = (on) => {
        if (on === running) return;
        if (on) since = Date.now();
        else base = elapsed();
        running = on;
        toggleBtn.textContent = running ? 'Pausar' : base ? 'Continuar' : 'Iniciar';
      };
      toggleBtn.addEventListener('click', () => setRunning(!running));
      $('[data-act="reset"]').addEventListener('click', () => {
        base = 0;
        since = Date.now();
        toggleBtn.textContent = running ? 'Pausar' : 'Iniciar';
      });
      setInterval(() => {
        $('.pr-elapsed').textContent = clock(elapsed());
        $('.pr-clock').textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }, 250);

      const link = APG.link(def.id, (m) => {
        if (m.type !== 'state') return;
        const moved = state && (state.index !== m.index || state.step !== m.step);
        if (moved) setRunning(true);
        state = m;
        connected(true);
        render();
      });

      let connTimer = 0;
      function connected(ok) {
        clearTimeout(connTimer);
        foot.textContent = ok
          ? 'Setas, Espaço e PageUp/PageDown aqui também passam os slides. B escurece a tela, R repete o slide.'
          : 'Sem conexão com a apresentação. Abra o deck e aperte P lá para ligar esta janela.';
        foot.classList.toggle('is-off', !ok);
      }
      connTimer = setTimeout(() => connected(false), 1500);
      link.send('hello', {});

      const notesEl = $('.pr-notes');
      function renderNotes(slide, step) {
        notesEl.textContent = '';
        const notes = slide.notes;
        if (!notes || (Array.isArray(notes) && !notes.length)) {
          notesEl.append(Object.assign(document.createElement('p'), { className: 'pr-empty', textContent: 'Sem roteiro neste slide.' }));
          return;
        }
        const parts = Array.isArray(notes) ? notes : String(notes).split(/\n\s*\n/);
        const perStep = Array.isArray(notes);
        parts.forEach((t, i) => {
          const p = document.createElement('p');
          p.textContent = t;
          if (perStep) {
            p.classList.toggle('is-now', i === Math.min(step, parts.length - 1));
            p.classList.toggle('is-done', i < Math.min(step, parts.length - 1));
          }
          notesEl.append(p);
        });
        const now = notesEl.querySelector('.is-now');
        if (now) now.scrollIntoView({ block: 'nearest' });
      }

      function render() {
        if (!state) return;
        const html = document.documentElement;
        html.dataset.theme = state.theme;
        html.dataset.font = state.font;
        APG.render.textScale = state.textScale || 1;
        html.style.setProperty('--ts', state.textScale || 1);
        const { index, step } = state;
        const now = APG.render.mountStatic($('.pr-now'), def, index, step);
        $('.pr-pos').textContent = `Slide ${index + 1} de ${n}${now.maxStep ? `, passo ${step + 1} de ${now.maxStep + 1}` : ''}${state.blank ? ' (tela escura)' : ''}`;
        const nextHolder = $('.pr-next');
        if (index + 1 < n) {
          APG.render.mountStatic(nextHolder, def, index + 1, 'last');
          $('.pr-cap--next').textContent = `Próximo slide (${index + 2})`;
        } else {
          nextHolder.textContent = '';
          nextHolder.append(Object.assign(document.createElement('p'), { className: 'pr-end', textContent: 'Fim do deck' }));
          $('.pr-cap--next').textContent = 'Próximo slide';
        }
        renderNotes(def.slides[index], step);
      }

      // Teclas de navegação viram comandos para a janela da apresentação.
      const CMDS = {
        ArrowRight: 'next', ' ': 'next', PageDown: 'next', ArrowDown: 'next',
        ArrowLeft: 'prev', PageUp: 'prev', ArrowUp: 'prev', Backspace: 'prev',
        Home: 'first', End: 'last', b: 'blank', '.': 'blank', r: 'replay',
      };
      window.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.target.closest && e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        const cmd = CMDS[key];
        if (!cmd) return;
        e.preventDefault();
        link.send('cmd', { cmd });
      });
    },
  };
})();
