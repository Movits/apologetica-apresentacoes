/* Animações dos slides com a Web Animations API.

   O render marca cada elemento animado com:
     data-step  passo em que aparece (0 = ao entrar no slide)
     data-anim  como aparece: words, rise, fade, fadein, zoom, frame, drawx,
                drawy, pop, count ou underline
     data-at    quando, dentro do passo: "300" = 300 ms depois do início do
                passo; "+0" ou "+-400" = relativo ao fim do elemento anterior
                do mesmo passo (negativo sobrepõe).
   Tudo usa fill: 'backwards', então o estado final é o estilo normal do
   elemento e nada fica preso no fim da animação.

   Movimento reduzido (sistema ou painel) troca deslocamentos por opacidade e
   desliga o Ken Burns e o contador. */
(function () {
  'use strict';
  const APG = window.APG;
  const A = (APG.anim = {});

  // Curvas da casa: saída forte para entradas, ease-in-out forte para o traço
  // que se desenha, senoidal para o Ken Burns que vai e volta.
  const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
  const EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';
  const EASE_SINE = 'cubic-bezier(0.45, 0, 0.55, 1)';

  let speed = 1;
  let reduced = false;
  A.configure = (o) => {
    if (o.speed) speed = Math.max(0.25, Math.min(3, o.speed));
    if (o.reduced != null) reduced = !!o.reduced;
  };
  A.isReduced = () => reduced;
  const D = (ms) => ms / speed;

  // ---------- Registro do que está rodando em cada slide ----------

  const registry = new WeakMap();
  const bag = (slide) => {
    let b = registry.get(slide);
    if (!b) registry.set(slide, (b = { live: new Set(), ambient: new Set() }));
    return b;
  };
  // Tarefa = { finish(), cancel() }. Animações WAAPI entram embrulhadas.
  const track = (slide, task) => {
    const b = bag(slide);
    b.live.add(task);
    return task;
  };
  const run = (slide, el, frames, opts) => {
    const a = el.animate(frames, { fill: 'backwards', ...opts });
    const task = track(slide, { finish: () => a.finish(), cancel: () => a.cancel() });
    a.onfinish = () => bag(slide).live.delete(task);
    return a;
  };
  const later = (slide, ms, fn) => {
    let done = false;
    const go = () => { if (!done) { done = true; fn(); } };
    const id = setTimeout(go, ms);
    track(slide, { finish: () => { clearTimeout(id); go(); }, cancel: () => { done = true; clearTimeout(id); } });
  };

  // Termina na hora tudo o que estiver no meio (avançar rápido não atropela).
  A.finish = (slide) => {
    const b = bag(slide);
    for (const t of [...b.live]) t.finish();
    b.live.clear();
  };
  const cancelLive = (slide) => {
    const b = bag(slide);
    for (const t of [...b.live]) t.cancel();
    b.live.clear();
  };
  A.dispose = (slide) => {
    cancelLive(slide);
    const b = bag(slide);
    for (const a of b.ambient) a.cancel();
    b.ambient.clear();
  };

  // ---------- Tipos de entrada ----------

  const fadeIn = (slide, el, t0, ms = 420) => {
    run(slide, el, [{ opacity: 0 }, { opacity: 1 }], { duration: D(ms), delay: t0, easing: 'ease' });
    return t0 + D(ms);
  };

  const KINDS = {
    words(slide, el, t0) {
      if (reduced) return fadeIn(slide, el, t0, 520);
      const ws = el.querySelectorAll('.w');
      const per = D(620);
      // Textos longos não podem levar uma eternidade: o atraso entre palavras
      // encolhe para o todo caber em ~2,6 s.
      const gap = D(Math.min(44, 2600 / Math.max(ws.length, 1)));
      ws.forEach((w, i) => {
        run(slide, w, [
          { opacity: 0, transform: 'translateY(0.32em)' },
          { opacity: 1, transform: 'none' },
        ], { duration: per, delay: t0 + i * gap, easing: EASE_OUT });
      });
      return t0 + Math.max(0, ws.length - 1) * gap + per;
    },

    // Título: cada palavra sobe de dentro de uma máscara.
    rise(slide, el, t0) {
      if (reduced) return fadeIn(slide, el, t0, 520);
      const ws = el.querySelectorAll('.w');
      const per = D(1050);
      const gap = D(Math.min(70, 900 / Math.max(ws.length, 1)));
      ws.forEach((w, i) => {
        run(slide, w, [
          // 135%: abaixo do respiro da máscara, para nem o topo dos acentos
          // aparecer antes da hora.
          { transform: 'translateY(135%)' },
          { transform: 'none' },
        ], { duration: per, delay: t0 + i * gap, easing: EASE_OUT });
      });
      return t0 + Math.max(0, ws.length - 1) * gap + per;
    },

    fade(slide, el, t0) {
      if (reduced) return fadeIn(slide, el, t0);
      run(slide, el, [
        { opacity: 0, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'none' },
      ], { duration: D(720), delay: t0, easing: EASE_OUT });
      return t0 + D(720);
    },

    fadein(slide, el, t0) {
      return fadeIn(slide, el, t0, 700);
    },

    zoom(slide, el, t0) {
      if (reduced) return fadeIn(slide, el, t0);
      run(slide, el, [
        { opacity: 0, transform: 'scale(0.94)' },
        { opacity: 1, transform: 'none' },
      ], { duration: D(1300), delay: t0, easing: EASE_OUT });
      return t0 + D(1300);
    },

    frame(slide, el, t0) {
      if (reduced) return fadeIn(slide, el, t0);
      run(slide, el, [
        { opacity: 0, transform: 'scale(0.985)' },
        { opacity: 1, transform: 'none' },
      ], { duration: D(1200), delay: t0, easing: EASE_OUT });
      return t0 + D(1200);
    },

    // Linhas que se desenham (eixo da linha do tempo, divisórias).
    drawx(slide, el, t0) {
      if (reduced) return fadeIn(slide, el, t0);
      run(slide, el, [
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0 0 0)' },
      ], { duration: D(900), delay: t0, easing: EASE_IN_OUT });
      return t0 + D(900);
    },

    drawy(slide, el, t0) {
      if (reduced) return fadeIn(slide, el, t0);
      run(slide, el, [
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0 0)' },
      ], { duration: D(900), delay: t0, easing: EASE_IN_OUT });
      return t0 + D(900);
    },

    pop(slide, el, t0) {
      if (reduced) return fadeIn(slide, el, t0);
      run(slide, el, [
        { opacity: 0, transform: 'scale(0.6)' },
        { opacity: 1, transform: 'none' },
      ], { duration: D(520), delay: t0, easing: EASE_OUT });
      return t0 + D(520);
    },

    count(slide, el, t0) {
      const live = el.querySelector('.num-live');
      const from = Number(el.dataset.from) || 0;
      const to = Number(el.dataset.to) || 0;
      const fmt = A.numberFormat(el.dataset.locale, Number(el.dataset.decimals) || 0);
      const end = fadeIn(slide, el, t0, 500);
      if (reduced) {
        live.textContent = fmt(to);
        return end;
      }
      const dur = D(2000);
      live.textContent = fmt(from);
      const start = performance.now() + t0;
      let raf = 0;
      const tick = (now) => {
        const p = Math.min(1, Math.max(0, (now - start) / dur));
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        live.textContent = fmt(from + (to - from) * e);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      track(slide, {
        finish: () => { cancelAnimationFrame(raf); live.textContent = fmt(to); },
        cancel: () => cancelAnimationFrame(raf),
      });
      return t0 + dur;
    },

    underline(slide, el, t0) {
      return drawUnderline(slide, el, t0, true);
    },
  };

  A.numberFormat = (locale, decimals) => {
    const nf = new Intl.NumberFormat(locale || 'pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return (n) => nf.format(decimals ? n : Math.round(n));
  };

  // ---------- Sublinhado dourado ----------

  const SVG = 'http://www.w3.org/2000/svg';

  // Posição de um elemento dentro do slide em px do palco, pela cadeia de
  // offsetParent: ignora transforms (escala do palco, palavras no meio da
  // animação) e por isso vale igual no palco, nas miniaturas e no apresentador.
  const offsetIn = (el, root) => {
    let x = 0;
    let y = 0;
    let n = el;
    while (n && n !== root) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent;
    }
    return { x, y };
  };

  // Linha de base real da palavra (vale para qualquer fonte): um marcador de
  // tamanho zero alinhado pela base, medido e retirado.
  const baselineOf = (w, slide) => {
    const m = document.createElement('span');
    m.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    w.appendChild(m);
    const y = offsetIn(m, slide).y;
    m.remove();
    return y;
  };

  // Uma linha de sublinhado por linha de texto que o destaque ocupa.
  const fragments = (slide, hl) => {
    const lines = [];
    for (const w of hl.querySelectorAll('.w')) {
      const o = offsetIn(w, slide);
      const fs = parseFloat(getComputedStyle(w).fontSize) || 40;
      // Pontuação nas pontas (.wp) fica fora do traço.
      const lead = w.firstChild && w.firstChild.classList && w.firstChild.classList.contains('wp') ? w.firstChild.offsetWidth : 0;
      const trail = w.lastChild && w.lastChild.classList && w.lastChild.classList.contains('wp') ? w.lastChild.offsetWidth : 0;
      const x0 = o.x + lead;
      const x1 = o.x + w.offsetWidth - trail;
      let line = lines.find((l) => Math.abs(l.y - o.y) < fs * 0.5);
      if (!line) lines.push((line = { y: o.y, x0, x1, base: baselineOf(w, slide), fs }));
      else {
        line.x0 = Math.min(line.x0, x0);
        line.x1 = Math.max(line.x1, x1);
      }
    }
    return lines;
  };

  const layer = (slide) => {
    let svg = slide.querySelector(':scope > .ul-layer');
    if (!svg) {
      svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('class', 'ul-layer');
      svg.setAttribute('viewBox', '0 0 1920 1080');
      svg.setAttribute('aria-hidden', 'true');
      slide.insertBefore(svg, slide.querySelector(':scope > .content'));
    }
    return svg;
  };

  // Traço levemente irregular, como feito à mão com pena.
  const strokePath = (l) => {
    const pad = l.fs * 0.05;
    const x0 = l.x0 - pad;
    const x1 = l.x1 + pad;
    const w = x1 - x0;
    const y = l.base + l.fs * 0.12;
    const a = l.fs * 0.045;
    return `M ${x0.toFixed(1)} ${(y + a * 0.4).toFixed(1)} C ${(x0 + w * 0.3).toFixed(1)} ${(y - a).toFixed(1)}, ${(x0 + w * 0.7).toFixed(1)} ${(y + a).toFixed(1)}, ${x1.toFixed(1)} ${(y - a * 0.5).toFixed(1)}`;
  };

  const clearUnderline = (hl) => {
    (hl._paths || []).forEach((p) => p.remove());
    hl._paths = [];
    hl.classList.remove('is-lit');
  };

  function drawUnderline(slide, hl, t0, animate) {
    clearUnderline(hl);
    const svg = layer(slide);
    const lines = fragments(slide, hl);
    hl._paths = lines.map((l) => {
      const p = document.createElementNS(SVG, 'path');
      p.setAttribute('d', strokePath(l));
      p.setAttribute('pathLength', '1');
      p.style.strokeWidth = `${(l.fs * 0.075).toFixed(1)}px`;
      svg.appendChild(p);
      return p;
    });
    if (!animate) {
      hl.classList.add('is-lit');
      return t0;
    }
    if (reduced) {
      hl._paths.forEach((p) => run(slide, p, [{ opacity: 0 }, { opacity: 1 }], { duration: D(360), delay: t0, easing: 'ease' }));
      later(slide, t0, () => hl.classList.add('is-lit'));
      return t0 + D(360);
    }
    // Cada linha do destaque se desenha depois da anterior, na mesma
    // velocidade (linhas curtas terminam antes).
    const total = lines.reduce((s, l) => s + (l.x1 - l.x0), 0) || 1;
    const budget = D(Math.min(1100, 520 + total * 0.35));
    let t = t0;
    hl._paths.forEach((p, i) => {
      const d = Math.max(D(260), budget * ((lines[i].x1 - lines[i].x0) / total));
      run(slide, p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: d,
        delay: t,
        easing: lines.length === 1 ? EASE_IN_OUT : i === 0 ? 'cubic-bezier(0.77, 0, 1, 1)' : i === lines.length - 1 ? 'cubic-bezier(0, 0, 0.175, 1)' : 'linear',
      });
      t += d;
    });
    later(slide, t0 + D(120), () => hl.classList.add('is-lit'));
    return t;
  }

  // ---------- Estado estático e passos ----------

  // Mostra o slide como fica depois do passo `step`, sem animar (voltar,
  // pular pelo hash, miniaturas, apresentador). step = -1 esconde tudo.
  A.applyState = (slide, step) => {
    cancelLive(slide);
    slide.classList.add('no-tr');
    for (const el of slide.querySelectorAll('[data-step]')) {
      const on = Number(el.dataset.step) <= step;
      el.classList.toggle('is-pending', !on);
      if (el.dataset.anim === 'underline') {
        if (on) drawUnderline(slide, el, 0, false);
        else clearUnderline(el);
      } else if (el.dataset.anim === 'count') {
        const fmt = A.numberFormat(el.dataset.locale, Number(el.dataset.decimals) || 0);
        el.querySelector('.num-live').textContent = fmt(Number(on ? el.dataset.to : el.dataset.from) || 0);
      }
    }
    focus(slide, step);
    void slide.offsetWidth;
    slide.classList.remove('no-tr');
  };

  // Itens com data-focus que já passaram ficam mais apagados, desde que o
  // passo atual seja de um deles.
  function focus(slide, step) {
    const items = [...slide.querySelectorAll('[data-focus]')];
    const active = items.some((el) => Number(el.dataset.step) === step);
    for (const el of items) el.classList.toggle('is-past', active && Number(el.dataset.step) < step);
  }

  // Anima os elementos do passo `step`. `base` atrasa o passo inteiro (usado
  // na entrada do slide, para cruzar com a saída do anterior).
  A.playStep = (slide, step, base = 0) => {
    let prevEnd = base;
    for (const el of slide.querySelectorAll(`[data-step="${step}"]`)) {
      const at = el.dataset.at || '0';
      const t = Math.max(0, at[0] === '+' ? prevEnd + D(Number(at.slice(1)) || 0) : base + D(Number(at) || 0));
      el.classList.remove('is-pending');
      const kind = KINDS[el.dataset.anim] || KINDS.fade;
      prevEnd = kind(slide, el, t);
    }
    focus(slide, step);
  };

  // Movimento contínuo (Ken Burns) das obras de arte. Roda em qualquer modo de
  // entrada e não é terminado por A.finish.
  A.ambient = (slide) => {
    if (reduced) return;
    const b = bag(slide);
    for (const img of slide.querySelectorAll('[data-ambient]')) {
      const soft = img.dataset.ambient === 'kenburns-soft';
      const frames = soft
        ? [{ transform: 'scale(1.0)' }, { transform: 'scale(1.06) translate(-0.8%, -0.5%)' }]
        : [{ transform: 'scale(1.06) translate(0.8%, 0.6%)' }, { transform: 'scale(1.17) translate(-1.6%, -1.1%)' }];
      const a = img.animate(frames, { duration: D(soft ? 22000 : 26000), iterations: Infinity, direction: 'alternate', easing: EASE_SINE });
      b.ambient.add(a);
    }
  };

  // Saída do slide: só opacidade, curta, enquanto o próximo já começa a entrar.
  A.leave = (slide, ms = 320) => {
    cancelLive(slide);
    slide.classList.add('is-leaving');
    const a = slide.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D(ms), easing: EASE_OUT, fill: 'forwards' });
    let gone = false;
    const done = () => {
      if (gone) return;
      gone = true;
      A.dispose(slide);
      slide.remove();
    };
    a.onfinish = done;
    a.oncancel = done;
    // Reserva: com a janela em segundo plano o navegador não desenha quadros
    // e o onfinish pode não chegar; o slide que saiu não pode ficar no palco.
    setTimeout(done, D(ms) + 250);
  };
})();
