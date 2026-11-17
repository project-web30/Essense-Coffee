(() => {
  const WA = '62882010151504';
  const MENU = [
    { id: 'espresso', n: 'Espresso', p: 18000, c: 'kopi', d: 'Pekat dengan crema tebal, untuk yang suka kopi apa adanya.' },
    { id: 'mocha', n: 'Mocha', p: 25000, c: 'kopi', d: 'Espresso dan cokelat dengan manis-pahit yang seimbang.' },
    { id: 'latte', n: 'Latte', p: 25000, c: 'kopi', d: 'Espresso lembut dengan susu dan latte art.' },
    { id: 'americano', n: 'Iced Americano', p: 22000, c: 'kopi', d: 'Espresso dan es, ringan dan menyegarkan.' },
    { id: 'matcha', n: 'Matcha Latte', p: 26000, c: 'nonkopi', d: 'Matcha hijau dengan susu, tanpa kopi.' },
    { id: 'cake', n: 'Cake', p: 15000, c: 'dessert', d: 'Cake cokelat dengan lelehan cokelat hangat di dalamnya.' }
  ];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rp = n => 'Rp' + n.toLocaleString('id-ID');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cart = {};

  // Layar pembuka: kunci gulir sebentar, lalu lepas
  const pre = $('#preloader');
  if (pre && !reduce) {
    document.documentElement.classList.add('lock');
    const done = () => { document.documentElement.classList.remove('lock'); pre.remove(); };
    pre.addEventListener('animationend', e => { if (e.animationName === 'plOut') done(); });
    setTimeout(done, 4200); // jaga-jaga
  }

  // Header, progres gulir, tombol ke atas, parallax
  const header = $('#top'), nav = $('#nav'), burger = $('#burger');
  const bar = $('#progress'), totop = $('#toTop'), heroBg = $('#heroBg');
  let tick = false;
  const onScroll = () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      header.classList.toggle('solid', y > 40);
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      totop.classList.toggle('on', y > 700);
      if (!reduce && heroBg && y < innerHeight * 1.2) heroBg.style.transform = `translateY(${y * 0.25}px)`;
      tick = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  totop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

  // Tautan nav aktif
  const links = $$('nav a');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => io.observe(s));

  // Status buka / tutup (WIB)
  const hour = +new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Jakarta' }).format(new Date());
  const st = $('#status'), isOpen = hour >= 8;
  st.classList.toggle('off', !isOpen);
  $('span', st).textContent = isOpen ? 'Buka sekarang, sampai 24.00' : 'Tutup, buka lagi pukul 08.00';

  // Toast
  const toastEl = $('#toast'); let tt;
  const toast = msg => {
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('on'), 2200);
  };

  // Menu
  const grid = $('#menuGrid');
  grid.innerHTML = MENU.map(m => `
    <article class="item" data-c="${m.c}">
      <div class="fr"><img src="${m.id}.jpg" alt="${m.n}" loading="lazy"></div>
      <div class="row"><h3>${m.n}</h3><span class="pr">${rp(m.p)}</span></div>
      <p>${m.d}</p>
      <button class="btn" data-add="${m.id}">Tambah ke pesanan</button>
    </article>`).join('');
  $$('.tabs button').forEach(b => b.addEventListener('click', () => {
    $$('.tabs button').forEach(x => x.setAttribute('aria-pressed', x === b));
    let i = 0;
    $$('.item', grid).forEach(it => {
      const show = b.dataset.cat === 'all' || it.dataset.c === b.dataset.cat;
      it.hidden = !show;
      if (show) { it.classList.remove('pop', 'rv'); it.style.animationDelay = (i++ * 0.08) + 's'; void it.offsetWidth; it.classList.add('pop'); }
    });
  }));

  // Efek terbang ke keranjang
  const fly = from => {
    if (reduce) return;
    const to = $('#cartOpen').getBoundingClientRect(), f = from.getBoundingClientRect();
    const el = document.createElement('i'); el.className = 'fly';
    el.style.left = (f.left + f.width / 2 - 11) + 'px'; el.style.top = (f.top + f.height / 2 - 11) + 'px';
    document.body.append(el);
    const dx = to.left + to.width / 2 - (f.left + f.width / 2), dy = to.top + to.height / 2 - (f.top + f.height / 2);
    el.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * .5}px,${dy * .5 - 80}px) scale(1.2)`, opacity: 1, offset: .5 },
      { transform: `translate(${dx}px,${dy}px) scale(.3)`, opacity: .4 }
    ], { duration: 800, easing: 'cubic-bezier(.4,0,.2,1)' }).onfinish = () => {
      el.remove();
      const c = $('#cartCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    };
  };
  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const m = MENU.find(x => x.id === btn.dataset.add);
    cart[m.id] = (cart[m.id] || 0) + 1; render();
    fly(btn); toast(`${m.n} ditambahkan ke pesanan`);
    btn.textContent = 'Ditambahkan ✓'; btn.classList.add('added');
    setTimeout(() => { btn.textContent = 'Tambah ke pesanan'; btn.classList.remove('added'); }, 1200);
  });

  // Keranjang
  const drawer = $('#drawer'), scrim = $('#scrim'), lines = $('#lines');
  function render(bumpId) {
    const ids = Object.keys(cart).filter(k => cart[k] > 0);
    const count = ids.reduce((s, k) => s + cart[k], 0);
    const total = ids.reduce((s, k) => s + cart[k] * MENU.find(m => m.id === k).p, 0);
    $('#cartCount').textContent = count;
    $('#total').textContent = rp(total);
    $('#sendWA').disabled = !count;
    lines.innerHTML = ids.length ? ids.map(k => {
      const m = MENU.find(x => x.id === k);
      return `<li><b>${m.n}</b><span>${rp(m.p * cart[k])}</span>
        <div class="q"><button data-d="${k}" aria-label="Kurangi ${m.n}">−</button><span class="n${bumpId === k ? ' bump' : ''}">${cart[k]}</span><button data-u="${k}" aria-label="Tambah ${m.n}">+</button></div></li>`;
    }).join('') : '<li class="empty">Belum ada pesanan. Pilih menu dulu, ya.</li>';
  }
  lines.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset.d, u = b.dataset.u;
    if (d) cart[d]--; if (u) cart[u]++;
    render(d || u);
  });
  const toggle = open => {
    drawer.classList.toggle('open', open); scrim.classList.toggle('on', open);
    drawer.setAttribute('aria-hidden', !open);
    if (open) $('#cartClose').focus(); else $('#cartOpen').focus();
  };
  $('#cartOpen').addEventListener('click', () => toggle(true));
  $('#cartClose').addEventListener('click', () => toggle(false));
  $('#closeOrder').addEventListener('click', () => toggle(true));
  scrim.addEventListener('click', () => toggle(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) toggle(false); });
  $('#sendWA').addEventListener('click', () => {
    const ids = Object.keys(cart).filter(k => cart[k] > 0);
    const rows = ids.map(k => { const m = MENU.find(x => x.id === k); return `- ${cart[k]}x ${m.n} (${rp(m.p * cart[k])})`; });
    const total = ids.reduce((s, k) => s + cart[k] * MENU.find(m => m.id === k).p, 0);
    const name = $('#custName').value.trim(), note = $('#custNote').value.trim();
    const msg = ['Halo Essence Coffee, saya mau pesan:', ...rows, `Total: ${rp(total)}`, name && `Nama: ${name}`, note && `Catatan: ${note}`].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
  render();

  // Tab keunggulan
  const tabs = $$('.advlist button'), imgs = $$('.advimg img');
  tabs.forEach((t, i) => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-selected', x === t));
    imgs.forEach((im, j) => im.classList.toggle('on', i === j));
  }));

  // Animasi muncul saat gulir untuk setiap elemen
  const R = [
    ['h2', ''], ['.eyebrow:not(.h-in)', ''], ['.lead', ''], ['.feats li', ''], ['.collage > div', 'rv-z'],
    ['.visi .archfr', 'rv-arch'], ['.quote', ''], ['.misi li', 'rv-l'], ['.tabs', ''], ['.item', ''],
    ['.plan', 'rv-z'], ['.advlist button', 'rv-l'], ['.advimg', 'rv-arch'], ['.pics > div', 'rv-z'],
    ['.seg dt', 'rv-l'], ['.seg dd', ''], ['.team figure', 'rv-z'], ['.visitbox > div', ''],
    ['.visit .cta .btn', ''], ['.closing .medal', 'rv-z'], ['.closing .cta .btn', ''], ['.hot .badge', '']
  ];
  const seen = new Set(), proxy = new WeakMap();
  const rvIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const host = e.target; rvIO.unobserve(host);
    const el = proxy.get(host) || host; // elemen ber-clip-path diamati lewat induknya
    el.classList.add('in');
    if (el.matches('h2')) el.classList.add('seen');
    if (el.matches('.price')) countUp(el);
    // lepas kelas animasi setelah selesai agar efek hover/tilt tidak bentrok
    if (el.matches('.item,.plan,.team figure,.feats li,.misi li'))
      setTimeout(() => el.classList.remove('rv', 'in', 'rv-l', 'rv-r', 'rv-z'), 1400 + (parseFloat(el.style.getPropertyValue('--d')) || 0) * 1000);
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  R.forEach(([sel, cls]) => $$(sel).forEach(el => {
    if (seen.has(el)) return; seen.add(el);
    const sibs = [...el.parentElement.children].filter(c => c.matches(sel));
    const i = Math.max(0, sibs.indexOf(el));
    el.style.setProperty('--d', Math.min(i * .09, .5) + 's');
    el.classList.add('rv'); if (cls) el.classList.add(cls);
    if (cls === 'rv-arch') { proxy.set(el.parentElement, el); rvIO.observe(el.parentElement); }
    else rvIO.observe(el);
  }));
  $$('.price').forEach(el => rvIO.observe(el));

  function countUp(el) {
    if (reduce) return;
    const n = +el.dataset.n, t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / 1100, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(n * e) + 'k';
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Efek miring 3D mengikuti kursor (desktop)
  if (fine && !reduce) {
    document.addEventListener('pointermove', e => {
      const el = e.target.closest?.('.item,.plan,.team figure');
      if (!el || el.classList.contains('rv')) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg');
      el.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5)) * 8 + 'deg');
    });
    $$('.item,.plan,.team figure').forEach(el => el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    }));
  }

  // Efek klik: riak air + percikan emas
  const RIP = '.btn,.tabs button,.advlist button,.plan,.item .fr,.team figure,.feats li,.totop,.lines .q button';
  $$(RIP).forEach(el => el.classList.add('rp'));
  document.addEventListener('pointerdown', e => {
    if (reduce) return;
    const host = e.target.closest?.(RIP);
    if (host) {
      host.classList.add('rp');
      const r = host.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
      const d = document.createElement('span'); d.className = 'rip';
      d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
      host.append(d); setTimeout(() => d.remove(), 750);
    }
    if (e.target.closest?.('a,button,.plan,.item,figure,.medal')) {
      for (let i = 0; i < 7; i++) {
        const p = document.createElement('i'); p.className = 'spark';
        p.style.left = e.clientX - 3 + 'px'; p.style.top = e.clientY - 3 + 'px';
        document.body.append(p);
        const a = (Math.PI * 2 * i) / 7 + Math.random() * .6, dist = 26 + Math.random() * 26;
        p.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${Math.cos(a) * dist}px,${Math.sin(a) * dist}px) scale(0)`, opacity: 0 }],
          { duration: 600 + Math.random() * 200, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = () => p.remove();
      }
    }
  });
  // Klik pada logo: putar sebentar
  $$('.medal').forEach(m => m.addEventListener('click', () => {
    if (reduce) return;
    m.animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(360deg) scale(1.08)' }, { transform: 'rotate(360deg) scale(1)' }], { duration: 900, easing: 'cubic-bezier(.2,.7,.2,1)' });
  }));
})();
