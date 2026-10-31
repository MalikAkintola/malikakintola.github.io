// The site's only script. Everything it touches is readable and usable without it.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Markdown cannot carry attributes, so the case study's blocks are marked for the reveal here.
document.querySelectorAll<HTMLElement>('.case-prose > *').forEach((el) => {
  if (el.getBoundingClientRect().top < innerHeight) return; // already on screen: never hide it
  el.dataset.reveal = '';
});

// Reveal once when an element enters the viewport (from tasteskill base.js). Never leaves content hidden.
(() => {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window)) { targets.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  targets.forEach((el) => io.observe(el));
  addEventListener('load', () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
  }, 2500));
})();

// "This visit, measured live": time here, furthest scroll, sections seen and screen size, with a line of
// scroll position over the last minute. Everything stays in the browser.
(() => {
  const root = document.querySelector<HTMLElement>('[data-visit]');
  if (!root) return;
  const out = (k: string) => root.querySelector<HTMLElement>(`[data-m="${k}"]`)!;
  const line = root.querySelector<SVGPolylineElement>('[data-visit-line]')!;
  const area = root.querySelector<SVGPolylineElement>('[data-visit-area]')!;
  const sections = [...document.querySelectorAll<HTMLElement>('section[id]')];
  const seen = new Set<string>();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) seen.add(e.target.id);
  }, { threshold: 0.35 });
  sections.forEach((s) => io.observe(s));
  const samples: number[] = new Array(59).fill(0);
  let deepest = 0;
  const depth = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(100, Math.round((scrollY / max) * 100)) : 100;
  };
  // Real time since the page opened, so it stays right through a sleeping laptop or a hidden tab.
  const elapsed = () => {
    let secs = Math.floor((Date.now() - performance.timeOrigin) / 1000);
    const d = Math.floor(secs / 86400); secs -= d * 86400;
    const h = Math.floor(secs / 3600); secs -= h * 3600;
    const m = Math.floor(secs / 60); secs -= m * 60;
    const parts = [];
    if (d) parts.push(`${d} ${d === 1 ? 'day' : 'days'}`);
    if (d || h) parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`);
    if (d || h || m) parts.push(`${m} min`);
    parts.push(`${secs} sec`);
    return parts.join(' ');
  };
  const tick = () => {
    const now = depth();
    deepest = Math.max(deepest, now);
    samples.push(now);
    if (samples.length > 60) samples.shift();
    out('time').textContent = elapsed();
    out('depth').textContent = `${deepest}%`;
    out('seen').textContent = `${seen.size} of ${sections.length}`;
    out('screen').textContent = `${innerWidth} × ${innerHeight}`;
    const step = 300 / 59;
    const pts = samples.map((v, i) => `${(300 - (samples.length - 1 - i) * step).toFixed(1)},${(94 - v * 0.9).toFixed(1)}`);
    line.setAttribute('points', pts.join(' '));
    area.setAttribute('points', `${pts[0].split(',')[0]},96 ${pts.join(' ')} 300,96`);
  };
  tick();
  let timer = window.setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => {
    clearInterval(timer);
    if (!document.hidden) { tick(); timer = window.setInterval(tick, 1000); }
  });
})();

// The reel: every project's dashboard in turn, crossfading slowly. Pauses when the tab is hidden or the
// pointer rests on it; under reduced motion it stays on the first.
(() => {
  const reel = document.querySelector<HTMLElement>('[data-reel]');
  if (!reel || reduced) return;
  const pics = [...reel.querySelectorAll<HTMLElement>('[data-reel-pic]')];
  const caps = [...reel.querySelectorAll<HTMLElement>('[data-reel-caption]')];
  let i = 0, held = false;
  reel.addEventListener('mouseenter', () => { held = true; });
  reel.addEventListener('mouseleave', () => { held = false; });
  reel.addEventListener('focusin', () => { held = true; });
  reel.addEventListener('focusout', () => { held = false; });
  setInterval(() => {
    if (held || document.hidden) return;
    i = (i + 1) % pics.length;
    pics.forEach((p, k) => p.classList.toggle('is-on', k === i));
    caps.forEach((c, k) => c.classList.toggle('is-on', k === i));
  }, 5500);
})();

// RFM demonstration: two customers ranked by revenue and by RFM. With two customers, RFM is three
// head-to-head comparisons: the more recent order, the more orders, the higher spend.
(() => {
  const root = document.querySelector<HTMLElement>('[data-rfm]');
  if (!root) return;
  type C = { days: number; orders: number; spent: number };
  const start: Record<'a' | 'b', C> = { a: { days: 150, orders: 1, spent: 575 }, b: { days: 10, orders: 8, spent: 450 } };
  const state = structuredClone(start);
  const names = { a: 'Customer A', b: 'Customer B' };
  const inputs = [...root.querySelectorAll<HTMLInputElement>('[data-in]')];
  const lists = { revenue: root.querySelector<HTMLElement>('[data-rank="revenue"]')!, rfm: root.querySelector<HTMLElement>('[data-rank="rfm"]')! };
  const verdict = root.querySelector<HTMLElement>('[data-verdict]')!;

  const place = (list: HTMLElement, order: ('a' | 'b')[]) => {
    const items = [...list.children] as HTMLElement[];
    const before = new Map(items.map((el) => [el, el.getBoundingClientRect().top]));
    order.forEach((id) => list.appendChild(list.querySelector(`[data-c="${id}"]`)!));
    if (reduced) return;
    items.forEach((el) => {
      const dy = (before.get(el) ?? 0) - el.getBoundingClientRect().top;
      if (dy) el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    });
  };

  const render = () => {
    const { a, b } = state;
    const won = {
      a: { r: a.days < b.days, f: a.orders > b.orders, m: a.spent > b.spent },
      b: { r: b.days < a.days, f: b.orders > a.orders, m: b.spent > a.spent },
    };
    const points = (id: 'a' | 'b') => Object.values(won[id]).filter(Boolean).length;
    const byRevenue: ('a' | 'b')[] = a.spent >= b.spent ? ['a', 'b'] : ['b', 'a'];
    const byRfm: ('a' | 'b')[] = points('a') !== points('b')
      ? (points('a') > points('b') ? ['a', 'b'] : ['b', 'a'])
      : (a.days <= b.days ? ['a', 'b'] : ['b', 'a']);
    (['a', 'b'] as const).forEach((id) => {
      root.querySelector(`[data-out="${id}-spent"]`)!.textContent = `$${state[id].spent}`;
      const marks = root.querySelector<HTMLElement>(`[data-marks="${id}"]`)!;
      (['r', 'f', 'm'] as const).forEach((k) => {
        const el = marks.querySelector<HTMLElement>(`[data-mark="${k}"]`)!;
        el.textContent = won[id][k] ? 'Yes' : 'No';
        el.dataset.won = String(won[id][k]);
      });
    });
    place(lists.revenue, byRevenue);
    place(lists.rfm, byRfm);
    verdict.textContent = byRevenue[0] === byRfm[0]
      ? `Both rankings put ${names[byRfm[0]]} first.`
      : `Revenue puts ${names[byRevenue[0]]} first. RFM puts ${names[byRfm[0]]} first.`;
  };

  inputs.forEach((input) => {
    const [id, key] = input.dataset.in!.split('-') as ['a' | 'b', keyof C];
    input.addEventListener('input', () => {
      state[id][key] = Number(input.value);
      root.querySelector(`[data-show="${id}-${key}"]`)!.textContent = input.value;
      render();
    });
  });
  root.querySelector('[data-reset]')?.addEventListener('click', () => {
    Object.assign(state.a, start.a); Object.assign(state.b, start.b);
    inputs.forEach((input) => {
      const [id, key] = input.dataset.in!.split('-') as ['a' | 'b', keyof C];
      input.value = String(state[id][key]);
      root.querySelector(`[data-show="${id}-${key}"]`)!.textContent = input.value;
    });
    render();
  });
  render();
})();

// Live dashboards load only when asked: each Power BI report is several megabytes.
document.querySelectorAll<HTMLElement>('[data-embed]').forEach((box) => {
  const button = box.querySelector<HTMLButtonElement>('[data-embed-load]');
  button?.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = box.dataset.embed!;
    frame.title = box.dataset.embedTitle ?? 'Live Power BI dashboard';
    frame.allowFullscreen = true;
    box.classList.add('is-live');
    box.querySelector('[data-embed-poster]')?.replaceWith(frame);
    frame.focus();
  });
});
