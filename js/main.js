/* =====================================================================
   naaiprem.foto — main.js
   ไฟล์นี้เป็น logic ทั้งหมดของเว็บ ปกติไม่ต้องแก้
   ถ้าจะเปลี่ยนภาพ / ข้อมูลติดต่อ / รีวิว / ตัวเลข ให้แก้ที่ js/data.js
   ===================================================================== */
(() => {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduceMotion = () => reducedMotionQuery.matches;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const lockScroll = (on) => document.documentElement.classList.toggle('is-locked', on);
  const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ตัวเลขวิ่งนับขึ้นจาก 0 (ใช้กับตัวนับสถิติและราคาเริ่มต้น)
  function countUp(el, target, format, duration = 1600) {
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      el.textContent = format(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    el.textContent = format(0);
    requestAnimationFrame(tick);
  }

  // เรียก fn(el) ทุกครั้งที่ element เลื่อนเข้ามาในจอ (ออกไปแล้วกลับมาจะเล่นใหม่)
  function onEachVisible(els, fn, threshold = 0.6) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) fn(entry.target);
      });
    }, { threshold });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- 1) ลิงก์ติดต่อจาก CONTACT ---------- */
  function initContacts() {
    $$('[data-contact]').forEach((el) => {
      const url = CONTACT[el.dataset.contact];
      if (!url) return;
      el.href = url;
      if (/^https?:/.test(url)) {
        el.target = '_blank';
        el.rel = 'noopener';
      }
    });
    $$('[data-contact-text]').forEach((el) => {
      const value = CONTACT[el.dataset.contactText];
      if (value) el.textContent = value;
    });
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- 2) Navbar ---------- */
  function initNav() {
    const nav = $('#nav');
    const toggle = $('#navToggle');
    const menu = $('#navMenu');

    // โปร่งใส → ดำทึบเมื่อเลื่อนลง
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // เมนูแฮมเบอร์เกอร์ (มือถือ / แท็บเล็ต)
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'ปิดเมนู' : 'เปิดเมนู');
      lockScroll(open);
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
      if (e.matches && nav.classList.contains('is-open')) setOpen(false);
    });

    // ไฮไลต์เมนูตาม section ที่กำลังดู
    const links = $$('.nav__link');
    const linkById = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove('is-active'));
        linkById.get(entry.target.id)?.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach((s) => spy.observe(s));
  }

  /* ---------- 3) หน้าปก: คอลัมน์ภาพเฉียง + แถวภาพเฉียง (หน้าจอง) ---------- */
  // ภาพย่อจากรายการใน data.js (หน้าปกใช้ COVER → images/cover/, แถวภาพเฉียงใช้ STRIP → images/strip/)
  function thumbsFrom(list, folder) {
    if (!Array.isArray(list)) return [];
    const bySrc = new Map(GALLERY.map((g) => [g.src, g]));
    return list.map((src) => bySrc.get(src)).filter(Boolean).map((g) => ({
      src: `images/${folder}/${g.src.split('/').pop()}`, w: g.width, h: g.height,
    }));
  }

  function initCover() {
    const tilt = $('#coverTilt');
    const thumbs = thumbsFrom(typeof COVER === 'undefined' ? [] : COVER, 'cover');
    if (!tilt || !thumbs.length) return;
    const cols = window.matchMedia('(max-width: 767px)').matches ? 6 : 9;
    const perCol = 8;
    let html = '';
    for (let c = 0; c < cols; c++) {
      // แต่ละคอลัมน์ใช้ภาพช่วงถัดไปของรายการ → คอลัมน์ติดกันไม่ซ้ำกัน (ภาพ 45 ภาพ = 5 คอลัมน์แรกไม่ซ้ำกันเลย)
      const items = Array.from({ length: perCol }, (_, k) => thumbs[(c * perCol + k) % thumbs.length])
        .map((t) => `<figure class="cover__item"><img src="${esc(t.src)}" alt="" width="${t.w}" height="${t.h}" decoding="async"></figure>`)
        .join('');
      // ชุดภาพซ้ำ 2 รอบ เพื่อให้เลื่อนวนได้ไม่สะดุด / แต่ละคอลัมน์เร็วไม่เท่ากัน
      html += `<div class="cover__col"><div class="cover__track" style="--dur:${54 + (c % 4) * 9}s; --delay:-${(c * 7) % 30}s">${items}${items}</div></div>`;
    }
    tilt.innerHTML = html;
  }

  function initTiltRow() {
    const track = $('[data-tiltrow]');
    const thumbs = thumbsFrom(typeof STRIP === 'undefined' ? [] : STRIP, 'strip');
    if (!track || !thumbs.length) return;
    const items = thumbs.map((t) => `<figure class="tiltrow__item"><img src="${esc(t.src)}" alt="" width="${t.w}" height="${t.h}" loading="lazy" decoding="async"></figure>`).join('');
    track.innerHTML = items + items;
    track.style.setProperty('--dur', `${thumbs.length * 4}s`);
  }

  /* ---------- 4) Gallery: แยกหมวด + Masonry + Load more ---------- */
  function initGallery(lightbox) {
    const groups = $$('.gallery__group');
    if (!groups.length) return;

    if (SETTINGS.grayscaleHover) document.body.classList.add('fx-grayscale');

    const ROW = 8; // ต้องตรงกับ grid-auto-rows ใน CSS
    const initial = SETTINGS.initialCount || 8;
    const step = SETTINGS.loadMoreCount || 12;
    const items = GALLERY.map((data, index) => ({ ...data, index, el: null }));
    const grids = [];

    // ภาพค่อยๆ โผล่ขึ้นทีละภาพเมื่อเลื่อนมาเห็น — เลื่อนผ่านไปแล้วกลับมาก็เล่นใหม่
    const revealIO = reduceMotion() || !('IntersectionObserver' in window) ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-in', entry.isIntersecting));
    }, { rootMargin: '0px 0px -6% 0px' });

    function createItem(it) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'gallery__item';
      el.dataset.index = it.index;
      el.setAttribute('aria-label', `ดูภาพเต็มจอ: ${it.title} — ${it.alt}`);
      el.innerHTML = `
        <span class="gallery__frame" style="aspect-ratio: ${it.width} / ${it.height}">
          <img class="gallery__img" src="${esc(it.src)}" alt="${esc(it.alt)}"
               width="${it.width}" height="${it.height}" loading="lazy" decoding="async">
          <span class="gallery__info" aria-hidden="true">
            <span class="gallery__title">${esc(it.title)}</span>
          </span>
        </span>`;
      const img = $('img', el);
      const loaded = () => img.classList.add('is-loaded');
      if (img.complete && img.naturalWidth) loaded();
      else {
        img.addEventListener('load', loaded, { once: true });
        img.addEventListener('error', loaded, { once: true });
      }
      return el;
    }

    // คำนวณจำนวนแถว (span) จากสัดส่วนภาพจริง → ภาพไม่ถูกครอป และไม่เกิด layout shift ระหว่างรอโหลด
    function setSpans(grid, list) {
      const style = getComputedStyle(grid);
      const cols = style.gridTemplateColumns.split(' ').filter(Boolean).length || 1;
      const gap = parseFloat(style.columnGap) || 0;
      const colWidth = (grid.clientWidth - gap * (cols - 1)) / cols;
      list.forEach((it) => {
        const h = (colWidth * it.height) / it.width;
        it.el.style.gridRowEnd = `span ${Math.ceil((h + gap) / ROW)}`;
      });
    }

    groups.forEach((group) => {
      const category = group.dataset.category;
      const grid = $('[data-gallery-grid]', group);
      const moreBtn = $('[data-load-more]', group);
      const list = items.filter((it) => it.category === category);

      // ยังไม่มีภาพในหมวดนี้ → ซ่อนทั้งหมวดและลิงก์ทางลัด
      if (!list.length) {
        group.hidden = true;
        $$(`[data-jump="${category}"]`).forEach((a) => { a.hidden = true; });
        return;
      }

      const countEl = $('[data-gallery-count]', group);
      if (countEl) countEl.textContent = `${list.length} ภาพ`;

      let shown = 0;
      const visible = () => list.slice(0, shown);

      function showMore(count) {
        const next = list.slice(shown, shown + count);
        shown += next.length;
        const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
        next.forEach((it, k) => {
          it.el = createItem(it);
          it.el.style.setProperty('--k', k % cols); // หน่วงเวลาไล่ตามคอลัมน์
          grid.appendChild(it.el);
          if (revealIO) revealIO.observe(it.el);
          else it.el.classList.add('is-in');
        });
        setSpans(grid, next);
        moreBtn.parentElement.hidden = shown >= list.length;
        return next;
      }

      moreBtn.addEventListener('click', () => {
        const added = showMore(step);
        // ดูครบแล้วปุ่มจะหายไป → ย้ายโฟกัสไปภาพแรกที่เพิ่งเพิ่ม (ผู้ใช้คีย์บอร์ดไม่หลุดไปต้นหน้า)
        if (added.length && moreBtn.parentElement.hidden) added[0].el.focus({ preventScroll: true });
      });

      // คลิกภาพ → เปิด Lightbox (เลื่อนดูได้ทุกภาพในหมวดนี้)
      grid.addEventListener('click', (e) => {
        const el = e.target.closest('.gallery__item');
        if (!el) return;
        lightbox.open(list, list.indexOf(items[el.dataset.index]));
      });

      grids.push({ grid, visible });
      showMore(initial);
    });

    // คำนวณ span ใหม่เมื่อความกว้างเปลี่ยน (หมุนจอ / ย่อหน้าต่าง)
    const lastWidth = new WeakMap();
    const ro = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const w = Math.round(entry.contentRect.width);
        if (w === lastWidth.get(entry.target)) return;
        lastWidth.set(entry.target, w);
        const g = grids.find((x) => x.grid === entry.target);
        requestAnimationFrame(() => setSpans(g.grid, g.visible())); // เลื่อนไปเฟรมถัดไป กัน ResizeObserver loop warning
      });
    });
    grids.forEach(({ grid }) => ro.observe(grid));
  }

  /* ---------- 5) Lightbox ---------- */
  function createLightbox() {
    const box = $('#lightbox');
    if (!box) return { open() {} }; // หน้าที่ไม่มี Lightbox (เช่น booking.html)
    const stage = $('#lightboxStage');
    const img = $('#lightboxImg');
    const caption = $('#lightboxCaption');
    const count = $('#lightboxCount');
    const closeBtn = $('#lightboxClose');
    const prevBtn = $('#lightboxPrev');
    const nextBtn = $('#lightboxNext');

    let list = [];
    let index = 0;
    let lastFocus = null;
    let swapTimer = null;

    function load() {
      const it = list[index];
      const delay = img.classList.contains('is-loaded') && !reduceMotion() ? 200 : 0;
      img.classList.remove('is-loaded');
      clearTimeout(swapTimer);
      swapTimer = setTimeout(() => {
        const pre = new Image();
        pre.onload = pre.onerror = () => {
          if (list[index] !== it) return; // ผู้ใช้เลื่อนไปภาพอื่นแล้ว
          img.src = it.src;
          img.alt = it.alt;
          requestAnimationFrame(() => img.classList.add('is-loaded'));
        };
        pre.src = it.src;
      }, delay);

      caption.innerHTML = `<span>${esc(CATEGORIES[it.category])}</span>${esc(it.title)}`;
      count.textContent = `${index + 1} / ${list.length}`;

      // โหลดภาพข้างเคียงรอไว้
      [index + 1, index - 1].forEach((k) => {
        const n = list[(k + list.length) % list.length];
        if (n) new Image().src = n.src;
      });
    }

    const go = (step) => {
      if (list.length < 2) return;
      index = (index + step + list.length) % list.length;
      load();
    };

    function open(items, start) {
      list = items;
      index = Math.max(0, start);
      lastFocus = document.activeElement;
      img.classList.remove('is-loaded');
      img.removeAttribute('src');
      box.hidden = false;
      requestAnimationFrame(() => box.classList.add('is-open'));
      lockScroll(true);
      load();
      closeBtn.focus();
    }

    function close() {
      box.classList.remove('is-open');
      lockScroll(false);
      setTimeout(() => { if (!box.classList.contains('is-open')) box.hidden = true; }, reduceMotion() ? 0 : 450);
      lastFocus?.focus({ preventScroll: true });
    }

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));

    // คลิกพื้นหลัง (ไม่ใช่ตัวภาพ) เพื่อปิด
    box.addEventListener('click', (e) => {
      if (e.target === box || e.target === stage || e.target.classList.contains('lightbox__bar')) close();
    });

    // คีย์บอร์ด: Esc ปิด, ลูกศรเลื่อนภาพ, Tab วนอยู่ใน Lightbox
    document.addEventListener('keydown', (e) => {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'Tab') {
        const focusables = [closeBtn, prevBtn, nextBtn];
        const i = focusables.indexOf(document.activeElement);
        e.preventDefault();
        const nextIndex = e.shiftKey ? (i <= 0 ? focusables.length - 1 : i - 1) : (i + 1) % focusables.length;
        focusables[nextIndex].focus();
      }
    });

    // ปัดซ้าย-ขวาบนมือถือ
    let startX = 0;
    let startY = 0;
    let dx = 0;
    let swiping = false;
    stage.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dx = 0;
      swiping = true;
    }, { passive: true });
    stage.addEventListener('touchmove', (e) => {
      if (!swiping) return;
      dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        img.classList.add('is-dragging');
        img.style.transform = `translateX(${dx * 0.6}px)`;
      }
    }, { passive: true });
    stage.addEventListener('touchend', () => {
      if (!swiping) return;
      swiping = false;
      img.classList.remove('is-dragging');
      img.style.transform = '';
      if (dx > 50) go(-1);
      else if (dx < -50) go(1);
    });

    return { open };
  }

  /* ---------- 6) ตัวนับเลข ---------- */
  function initStats() {
    const list = $('#statsList');
    if (!list || !STATS.length) return;

    const format = (n, suffix) => `${n.toLocaleString('en-US')}${suffix}`;
    list.innerHTML = STATS.map((s, k) => `
      <li class="stat reveal" data-delay="${k}">
        <span class="stat__num" data-target="${Number(s.value) || 0}" data-suffix="${esc(s.suffix || '')}">${format(Number(s.value) || 0, esc(s.suffix || ''))}</span>
        <span class="stat__label">${esc(s.label)}</span>
      </li>`).join('');

    if (reduceMotion()) return; // แสดงตัวเลขจริงทันที
    onEachVisible($$('.stat__num', list), (el) => {
      countUp(el, Number(el.dataset.target), (n) => format(n, el.dataset.suffix));
    });
  }

  /* ---------- 7) สไลด์รีวิว ---------- */
  function initReviews() {
    const slider = $('.reviews__slider');
    const track = $('#reviewsTrack');
    const dotsWrap = $('#reviewDots');
    if (!track || !REVIEWS.length) return;

    track.innerHTML = REVIEWS.map((r, k) => `
      <figure class="review" role="group" aria-roledescription="slide" aria-label="รีวิวที่ ${k + 1} จาก ${REVIEWS.length}">
        <span class="review__mark" aria-hidden="true">“</span>
        <blockquote class="review__text">${esc(r.text)}</blockquote>
        <figcaption class="review__meta">
          <span class="review__name">${esc(r.name)}</span>
          <span class="review__tag">${esc(CATEGORIES[r.category] || '')}</span>
          ${r.detail ? `<span class="review__detail">${esc(r.detail)}</span>` : ''}
        </figcaption>
      </figure>`).join('');
    dotsWrap.innerHTML = REVIEWS.map((_, k) => `<button class="reviews__dot" aria-label="ดูรีวิวที่ ${k + 1}"></button>`).join('');

    const dots = $$('.reviews__dot', dotsWrap);
    let index = 0;
    let timer = null;
    let paused = false;
    let inView = false;

    const updateDots = () => dots.forEach((d, k) => {
      d.classList.toggle('is-active', k === index);
      d.setAttribute('aria-current', k === index ? 'true' : 'false');
    });
    const go = (k) => {
      index = (k + REVIEWS.length) % REVIEWS.length;
      track.scrollTo({ left: index * track.clientWidth, behavior: reduceMotion() ? 'auto' : 'smooth' });
      updateDots();
    };
    const restart = () => {
      clearInterval(timer);
      if (reduceMotion()) return;
      timer = setInterval(() => {
        if (!paused && inView && !document.hidden) go(index + 1);
      }, SETTINGS.reviewInterval || 6500);
    };

    // ซิงก์จุดเมื่อผู้ใช้ปัดเอง
    track.addEventListener('scroll', () => {
      const k = Math.round(track.scrollLeft / track.clientWidth);
      if (k !== index) { index = k; updateDots(); }
    }, { passive: true });

    $('#reviewPrev').addEventListener('click', () => { go(index - 1); restart(); });
    $('#reviewNext').addEventListener('click', () => { go(index + 1); restart(); });
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); restart(); }));

    // หยุดเลื่อนอัตโนมัติเมื่อ hover / focus / แตะ
    slider.addEventListener('mouseenter', () => { paused = true; });
    slider.addEventListener('mouseleave', () => { paused = false; });
    slider.addEventListener('focusin', () => { paused = true; });
    slider.addEventListener('focusout', () => { paused = false; });
    track.addEventListener('touchstart', () => { paused = true; }, { passive: true });
    track.addEventListener('touchend', () => { paused = false; restart(); });
    window.addEventListener('resize', () => track.scrollTo({ left: index * track.clientWidth }));

    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }).observe(slider);

    updateDots();
    restart();
  }

  /* ---------- 8) FAQ Accordion (เปิดทีละข้อ) ---------- */
  function initFaq() {
    const items = $$('.faq__item');
    items.forEach((item) => {
      const btn = $('.faq__q', item);
      btn.addEventListener('click', () => {
        const willOpen = !item.classList.contains('is-open');
        items.forEach((other) => {
          other.classList.remove('is-open');
          $('.faq__q', other).setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------- 9) Reveal on scroll ---------- */
  function initReveal() {
    const els = $$('.reveal');
    els.forEach((el) => { if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay); });
    if (reduceMotion() || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    // เลื่อนผ่านไปแล้วกลับมา ลูกเล่นจะเล่นใหม่ทุกครั้ง (ใส่ data-once ถ้าต้องการให้เล่นครั้งเดียว)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          if ('once' in el.dataset) io.unobserve(el);
        } else {
          el.classList.remove('is-visible');
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    els.forEach((el) => io.observe(el));

    // Hero / ภาพปก: เลื่อนกลับขึ้นมาบนสุด ตัวอักษรและข้อความจะเล่นแอนิเมชันใหม่
    $$('.cover, .bhead').forEach((hero) => {
      new IntersectionObserver(([entry]) => {
        hero.classList.toggle('is-replay', !entry.isIntersecting);
      }).observe(hero);
    });
  }

  /* ---------- 9.1) เปิดเว็บแล้วเริ่มที่ด้านบนเสมอ ----------
     - ไม่ให้เบราว์เซอร์จำตำแหน่งเลื่อนเดิม (มือถือชอบเด้งไปกลางหน้า)
     - ลิงก์ในหน้า (#portfolio ฯลฯ) เลื่อนนุ่มๆ โดยไม่ทิ้ง # ไว้ใน URL → เปิดเว็บใหม่/รีเฟรชจะไม่เด้งไปส่วนเดิม
     - มาจากหน้าอื่นแบบ index.html#portfolio ยังพาไปส่วนนั้นได้ แล้วค่อยลบ # ออก */
  function initAnchors() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const fromLink = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (fromLink) {
      history.replaceState(null, '', location.pathname + location.search);
      fromLink.scrollIntoView();
      // ฟอนต์/ภาพโหลดเสร็จแล้วตำแหน่งอาจขยับ → เลื่อนให้ตรงอีกครั้ง (ถ้าผู้ใช้ยังไม่ได้เลื่อนเอง)
      const y = window.scrollY;
      window.addEventListener('load', () => { if (Math.abs(window.scrollY - y) < 4) fromLink.scrollIntoView(); }, { once: true });
    } else {
      window.scrollTo(0, 0);
    }

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      const id = decodeURIComponent(a.getAttribute('href').slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      const behavior = reduceMotion() ? 'auto' : 'smooth';
      if (id === 'home') window.scrollTo({ top: 0, behavior });
      else target.scrollIntoView({ behavior });
      if (a.classList.contains('skip-link')) { // ผู้ใช้คีย์บอร์ด: ย้ายโฟกัสไปส่วนที่เลือก
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  }

  /* ---------- 10) Parallax เบาๆ (Hero + CTA) ---------- */
  function initParallax() {
    if (reduceMotion()) return;
    const els = $$('[data-parallax]');
    if (!els.length) return;
    let ticking = false;

    const update = () => {
      const vh = window.innerHeight;
      els.forEach((el) => {
        const section = el.parentElement;
        const r = section.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const factor = parseFloat(el.dataset.parallax) || 0.2;
        const y = section.classList.contains('hero')
          ? -r.top * factor
          : (r.top + r.height / 2 - vh / 2) * -factor;
        el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- 11) Custom cursor (Desktop เท่านั้น) ---------- */
  function initCursor() {
    if (!finePointer() || reduceMotion()) return;

    const cursor = $('.cursor');
    if (!cursor) return;
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    document.body.classList.add('has-cursor');

    let mx = -100;
    let my = -100;
    let rx = mx;
    let ry = my;
    let raf = null;

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1 ? requestAnimationFrame(loop) : null;
    };

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      cursor.classList.add('is-active');
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));

    // ขยายเมื่ออยู่บนภาพผลงาน / ย่อเมื่ออยู่บนลิงก์และปุ่ม
    document.addEventListener('mouseover', (e) => {
      const onImage = !!e.target.closest('.gallery__item, .strip__item');
      cursor.classList.toggle('is-view', onImage);
      cursor.classList.toggle('is-link', !onImage && !!e.target.closest('a, button'));
    });
  }

  /* ---------- 12) ปุ่มลอยมือถือ ---------- */
  function initFab() {
    const fab = $('#fab');
    const toggle = $('#fabToggle');
    const cta = $('#contact');
    if (!fab) return;

    const setOpen = (open) => {
      fab.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'ปิดช่องทางติดต่อ' : 'เปิดช่องทางติดต่อ');
    };
    toggle.addEventListener('click', () => setOpen(!fab.classList.contains('is-open')));
    document.addEventListener('click', (e) => { if (!fab.contains(e.target)) setOpen(false); });

    // ซ่อนเมื่อถึงส่วน CTA (มีปุ่มติดต่อใหญ่อยู่แล้ว)
    if (cta) {
      new IntersectionObserver(([entry]) => {
        fab.classList.toggle('is-hidden', entry.isIntersecting);
        if (entry.isIntersecting) setOpen(false);
      }, { threshold: 0.2 }).observe(cta);
    }
  }

  /* ---------- 13) ลูกเล่นตอนเลื่อนหน้า: แถบความคืบหน้า + โลโก้หมุน ---------- */
  function initScrollFx() {
    const bar = $('#navProgress');
    const logo = $('.nav .logo');
    if (reduceMotion()) return;
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
      if (logo) logo.style.setProperty('--spin', `${(window.scrollY * 0.12).toFixed(1)}deg`);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ---------- 14) ชื่อแบรนด์ใน Hero ขึ้นทีละตัวอักษร ---------- */
  function initHeroBrand() {
    const brand = $('.hero__brand');
    if (!brand || reduceMotion()) return;
    brand.setAttribute('aria-label', brand.textContent.trim());
    brand.classList.remove('hero-in');
    let c = 0;
    const split = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          [...child.textContent].forEach((ch) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.setAttribute('aria-hidden', 'true');
            span.style.setProperty('--c', c++);
            span.textContent = ch;
            frag.appendChild(span);
          });
          child.replaceWith(frag);
        } else {
          split(child);
        }
      });
    };
    split(brand);
  }

  /* ---------- 15) แถบภาพวิ่ง ---------- */
  function initStrip(lightbox) {
    const wrap = $('#stripRows');
    if (!wrap || typeof STRIP === 'undefined') return;
    const bySrc = new Map(GALLERY.map((g) => [g.src, g]));
    const list = STRIP.map((src) => bySrc.get(src)).filter(Boolean);
    if (!list.length) { wrap.closest('section').hidden = true; return; }

    const thumb = (src) => `images/strip/${src.split('/').pop()}`;
    const rows = [list.filter((_, k) => k % 2 === 0), list.filter((_, k) => k % 2 === 1)].filter((r) => r.length);
    const itemHtml = (it, copy) => `
      <button type="button" class="strip__item" data-src="${esc(it.src)}" style="aspect-ratio: ${it.width} / ${it.height}"
        ${copy ? 'aria-hidden="true" tabindex="-1"' : `aria-label="ดูภาพเต็มจอ: ${esc(it.title)}"`}>
        <img src="${esc(thumb(it.src))}" alt="${copy ? '' : esc(it.alt)}" width="${it.width}" height="${it.height}" loading="lazy" decoding="async">
      </button>`;
    // ชุดภาพซ้ำ 2 รอบเพื่อให้วิ่งวนได้ต่อเนื่อง (ชุดที่ 2 ซ่อนจากโปรแกรมอ่านหน้าจอ)
    wrap.innerHTML = rows.map((row) => `
      <div class="strip__row">
        <div class="strip__track" style="--strip-dur: ${row.length * 6}s">
          ${row.map((it) => itemHtml(it, false)).join('')}${row.map((it) => itemHtml(it, true)).join('')}
        </div>
      </div>`).join('');

    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.strip__item');
      if (!btn) return;
      lightbox.open(list, list.findIndex((it) => it.src === btn.dataset.src));
    });
  }

  /* ---------- 16) การ์ดบริการ: เอียงตามเมาส์ + ราคาวิ่ง ---------- */
  function initServices() {
    const prices = $$('.service__price [data-count]');
    if (!reduceMotion()) {
      onEachVisible(prices, (el) => countUp(el, Number(el.dataset.count), (n) => n.toLocaleString('en-US'), 1400), 0.8);
    }

    if (!finePointer() || reduceMotion()) return;
    $$('.service').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;  // -0.5 … 0.5
        const y = (e.clientY - r.top) / r.height - 0.5;
        const angle = Math.hypot(x, y) * 12;             // สูงสุดราว 6 องศา
        card.style.rotate = `${-y} ${x} 0 ${angle.toFixed(2)}deg`;
      });
      card.addEventListener('pointerleave', () => { card.style.rotate = ''; });
    });
  }

  /* ---------- 17) ระบบจองคิวออนไลน์ (ข้อมูลไป Google Sheets ผ่าน Apps Script) ---------- */
  function initBooking() {
    const section = $('#booking');
    if (!section || typeof BOOKING === 'undefined') return;
    const layout = $('.booking__layout', section);
    if (!BOOKING.endpoint) { // ยังไม่ได้เชื่อม Google Sheets → ให้ทักแชทแทน
      layout.innerHTML = `<div class="booking__closed">
        <h2>ระบบจองออนไลน์ปิดชั่วคราว</h2>
        <p>ทักมาจองคิวหรือสอบถามที่เพจ NAAI PREM ได้เลย</p>
        <a class="btn btn--primary" href="${esc(CONTACT.messenger)}" target="_blank" rel="noopener">ทักแชทเพจ NAAI PREM</a>
      </div>`;
      $('#slipBox')?.remove();
      return;
    }

    const form = $('#bookingForm');
    const done = $('#bookingDone');
    const slipBox = $('#slipBox');
    const slipForm = $('#slipForm');
    const el = {
      types: $('#bookingTypes'), pkgStep: $('#bookingPkgStep'), pkgs: $('#bookingPkgs'),
      cal: $('#bookingCal'), calTitle: $('#calTitle'), calGrid: $('#calGrid'), calStatus: $('#calStatus'),
      date: $('#bookingDate'), busy: $('#bookingBusy'), hourly: $('#bookingHourly'),
      start: $('#bookingStart'), hours: $('#bookingHours'), pick: $('#bookingPick'),
      error: $('#bookingError'), submit: $('#bookingSubmit'),
    };

    const ticket = {
      media: $('#ticketMedia'), type: $('#ticketType'), pkg: $('#ticketPkg'), date: $('#ticketDate'),
      time: $('#ticketTime'), price: $('#ticketPrice'), bar: $('#ticketBar'), hint: $('#ticketHint'),
    };

    /* --- เวลา / วันที่ --- */
    const pad = (n) => String(n).padStart(2, '0');
    const toMin = (hm) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
    const toHM = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
    const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const parseYmd = (str) => { const [y, m, d] = str.split('-').map(Number); return new Date(y, m - 1, d); };
    const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    const thaiDate = (str) => parseYmd(str).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const fmtRanges = (ranges) => ranges.map(([a, b]) => `${a}–${b} น.`).join(' และ ');
    const digits = (v) => String(v || '').replace(/\D/g, '');

    // รหัสคำขอ: ส่งซ้ำด้วยรหัสเดิม ระบบจะไม่สร้างการจองซ้ำ (เปลี่ยนใหม่หลังจองสำเร็จ)
    const newRequestId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    let requestId = newRequestId();

    const today = new Date();
    let avail = { busy: {}, buffer: 0, minDate: ymd(addDays(today, 1)), maxDate: ymd(addDays(today, 400)) };
    const state = { type: null, pkg: null, date: null, month: null };
    state.month = parseYmd(avail.minDate);
    state.month.setDate(1);

    const currentType = () => BOOKING.types.find((t) => t.id === state.type) || null;
    const currentPkg = () => currentType()?.packages.find((p) => p.id === state.pkg) || null;

    /* --- ตรวจช่วงเวลาชนกัน (รวมเวลาเผื่อเดินทาง) — ต้องตรงกับ conflicts_ ใน Code.gs --- */
    const clash = (date, ranges) => {
      const busy = (avail.busy[date] || []).map(([a, b]) => [toMin(a), toMin(b)]);
      return ranges.some(([a, b]) => busy.some(([bs, be]) => toMin(a) < be + avail.buffer && bs < toMin(b) + avail.buffer));
    };
    const hourlyStarts = (date, hours) => {
      const out = [];
      const until = toMin(BOOKING.hourlyUntil || '22:00');
      for (let t = toMin(BOOKING.hourlyFrom || '06:00'); t + hours * 60 <= until; t += 30) {
        out.push({ start: toHM(t), ok: !clash(date, [[toHM(t), toHM(t + hours * 60)]]) });
      }
      return out;
    };
    function dayState(date) {
      if (date < avail.minDate || date > avail.maxDate) return 'off';
      const pkg = currentPkg();
      const fits = pkg && !pkg.hourly ? !clash(date, pkg.ranges) : hourlyStarts(date, pkg?.minHours || 1).some((x) => x.ok);
      if (!fits) return 'full';
      return (avail.busy[date] || []).length ? 'partial' : 'free';
    }

    /* --- ปฏิทิน --- */
    const STATE_LABEL = { off: 'ไม่เปิดจองออนไลน์', full: 'เต็ม', partial: 'ว่างบางช่วง', free: 'ว่าง' };
    function renderCalendar() {
      const y = state.month.getFullYear();
      const m = state.month.getMonth();
      const todayStr = ymd(today);
      el.calTitle.textContent = state.month.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
      let html = '<span></span>'.repeat(new Date(y, m, 1).getDay());
      const days = new Date(y, m + 1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const date = ymd(new Date(y, m, d));
        const st = dayState(date);
        const selected = date === state.date;
        html += `<button type="button" class="cal__day is-${st}${date === todayStr ? ' is-today' : ''}${selected ? ' is-selected' : ''}"
          data-date="${date}" aria-pressed="${selected}" aria-label="${thaiDate(date)} — ${STATE_LABEL[st]}"${st === 'off' || st === 'full' ? ' disabled' : ''}>${d}</button>`;
      }
      el.calGrid.innerHTML = html;
      const first = (str) => { const d = parseYmd(str); d.setDate(1); return d; };
      $('[data-cal="-1"]', el.cal).disabled = state.month <= first(avail.minDate);
      $('[data-cal="1"]', el.cal).disabled = state.month >= first(avail.maxDate);
    }

    /* --- เวลาของวันที่เลือก --- */
    function renderTime() {
      const pkg = currentPkg();
      el.hourly.hidden = true;
      el.pick.classList.remove('is-error');
      if (!state.date) {
        el.date.textContent = 'ยังไม่ได้เลือกวันที่';
        el.busy.innerHTML = '';
        el.pick.textContent = pkg ? 'เลือกวันที่จากปฏิทิน' : 'เลือกประเภทงานและรูปแบบการจองก่อน แล้วปฏิทินจะแสดงวันที่ว่างให้';
        updateTicket();
        return;
      }
      el.date.textContent = thaiDate(state.date);
      el.busy.innerHTML = (avail.busy[state.date] || []).map(([a, b]) => (a === '00:00' && b === '24:00'
        ? '<li>ปิดรับทั้งวัน</li>' : `<li>มีคิวแล้ว ${a}–${b} น.</li>`)).join('');
      if (!pkg) { el.pick.textContent = 'เลือกรูปแบบการจองก่อน'; updateTicket(); return; }
      if (pkg.hourly) {
        el.hourly.hidden = false;
        const min = pkg.minHours || 1;
        const max = pkg.maxHours || 8;
        const keepHours = Math.min(Math.max(Number(el.hours.value) || min, min), max);
        el.hours.innerHTML = Array.from({ length: max - min + 1 }, (_, i) => `<option value="${min + i}">${min + i} ชั่วโมง</option>`).join('');
        el.hours.value = String(keepHours);
        el.hours.disabled = min === max; // แพ็กเกจที่กำหนดจำนวนชั่วโมงไว้แล้ว (เช่น กลุ่ม 3 ชม.)
        fillStarts(el.start.value);
      }
      updatePick();
    }

    function fillStarts(keep) {
      const starts = hourlyStarts(state.date, Number(el.hours.value) || 1);
      el.start.innerHTML = '<option value="">เลือกเวลา</option>' + starts.map((x) =>
        `<option value="${x.start}"${x.ok ? '' : ' disabled'}>${x.start} น.${x.ok ? '' : ' (ไม่ว่าง)'}</option>`).join('');
      if (keep && starts.some((x) => x.start === keep && x.ok)) el.start.value = keep;
    }

    function selectedRanges() {
      const pkg = currentPkg();
      if (!pkg || !state.date) return null;
      let ranges = pkg.ranges;
      if (pkg.hourly) {
        if (!el.start.value) return null;
        ranges = [[el.start.value, toHM(toMin(el.start.value) + Number(el.hours.value) * 60)]];
      }
      return clash(state.date, ranges) ? null : ranges;
    }

    function pkgLabel() {
      const pkg = currentPkg();
      return pkg.hourly ? `${pkg.label} (${el.hours.value} ชม.)` : pkg.label;
    }

    function updatePick() {
      const ranges = selectedRanges();
      el.pick.innerHTML = ranges
        ? `<strong>${esc(currentType().label)} · ${esc(pkgLabel())}</strong><br>${esc(thaiDate(state.date))}<br>เวลา ${fmtRanges(ranges)}`
        : 'เลือกเวลาเริ่มและจำนวนชั่วโมง';
      updateTicket();
    }

    /* --- การ์ดสรุปการจอง: ภาพเปลี่ยนตามประเภทงาน + แถบความคืบหน้า --- */
    if (ticket.media) {
      ticket.media.innerHTML = BOOKING.types.filter((t) => t.image).map((t, k) =>
        `<img src="${esc(t.image)}" alt="" data-type="${esc(t.id)}" loading="lazy" decoding="async"${k === 0 ? ' class="is-active"' : ''}>`).join('');
    }
    function updateTicket() {
      if (!ticket.type) return;
      const type = currentType();
      const pkg = currentPkg();
      const ranges = selectedRanges();
      const imgs = $$('img', ticket.media);
      const active = (type && imgs.find((img) => img.dataset.type === type.id)) || imgs[0];
      imgs.forEach((img) => img.classList.toggle('is-active', img === active));
      ticket.type.textContent = type ? type.label : 'ยังไม่ได้เลือกงาน';
      ticket.pkg.textContent = pkg ? pkgLabel() : '—';
      if (ticket.price) ticket.price.textContent = pkg?.price || type?.price || '—';
      ticket.date.textContent = state.date ? thaiDate(state.date) : '—';
      ticket.time.textContent = ranges ? fmtRanges(ranges) : '—';
      const F = form.elements;
      const contactOk = F.name.value.trim().length >= 2 && /^0\d{8,9}$/.test(digits(F.phone.value))
        && F.place.value.trim() && F.province.value.trim() && F.source.value;
      const steps = [type, pkg, ranges, contactOk].filter(Boolean).length;
      ticket.bar.style.transform = `scaleX(${steps / 4})`;
      ticket.hint.textContent = steps === 4 ? 'ครบแล้ว! กด "ส่งคำขอจองคิว" ได้เลย' : `เลือกแล้ว ${steps} จาก 4 ขั้นตอน`;
    }
    form.addEventListener('input', updateTicket);

    /* --- ตัวเลือกประเภทงาน (การ์ดภาพ) / รูปแบบ --- */
    el.types.innerHTML = BOOKING.types.map((t) => `
      <label class="tcard">
        <input type="radio" name="type" value="${esc(t.id)}">
        <span class="tcard__media">${t.image ? `<img src="${esc(t.image)}" alt="" loading="lazy" decoding="async">` : ''}</span>
        <span class="tcard__body"><b>${esc(t.label)}</b>${t.price ? `<small>${esc(t.price)}</small>` : ''}</span>
        <i class="tcard__check" aria-hidden="true"></i>
      </label>`).join('');

    function renderPkgs() {
      const type = currentType();
      el.pkgStep.disabled = !type;
      if (!type) return;
      const timeInfo = (p) => {
        if (!p.hourly) return fmtRanges(p.ranges);
        if (p.minHours && p.minHours === p.maxHours) return `เลือกเวลาเริ่มเอง · ${p.minHours} ชม.`;
        return `เลือกเวลาเริ่มเอง · ${p.minHours ? `${p.minHours}–` : 'สูงสุด '}${p.maxHours || 8} ชม.`;
      };
      el.pkgs.innerHTML = type.packages.map((p) => `
        <label class="chip"><input type="radio" name="pkg" value="${esc(p.id)}">
          <span>${esc(p.label)}${p.price ? `<em>${esc(p.price)}</em>` : ''}<small>${timeInfo(p)}</small></span>
        </label>`).join('')
        + (type.note ? `<p class="booking__note">${esc(type.note)}</p>` : '');
      if (type.packages.length === 1) {
        $('input', el.pkgs).checked = true;
        state.pkg = type.packages[0].id;
      }
    }

    function onSelectionChange() {
      // วันที่เลือกไว้อาจไม่ว่างแล้วสำหรับรูปแบบใหม่
      if (state.date && dayState(state.date) === 'full') {
        state.date = null;
        renderCalendar();
        renderTime();
        el.pick.textContent = 'วันที่เลือกไว้ไม่ว่างสำหรับรูปแบบนี้ กรุณาเลือกวันใหม่';
        el.pick.classList.add('is-error');
        return;
      }
      renderCalendar();
      renderTime();
    }

    el.types.addEventListener('change', (e) => {
      state.type = e.target.value;
      state.pkg = null;
      renderPkgs();
      onSelectionChange();
    });
    el.pkgs.addEventListener('change', (e) => {
      state.pkg = e.target.value;
      onSelectionChange();
    });
    el.calGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.cal__day');
      if (!btn || btn.disabled) return;
      state.date = btn.dataset.date;
      el.calGrid.closest('.cal').classList.remove('is-invalid');
      renderCalendar();
      renderTime();
      $(`[data-date="${state.date}"]`, el.calGrid)?.focus();
    });
    $$('[data-cal]', el.cal).forEach((btn) => btn.addEventListener('click', () => {
      state.month = new Date(state.month.getFullYear(), state.month.getMonth() + Number(btn.dataset.cal), 1);
      renderCalendar();
    }));
    el.hours.addEventListener('change', () => { fillStarts(el.start.value); updatePick(); });
    el.start.addEventListener('change', () => { el.start.classList.remove('is-invalid'); updatePick(); });

    $('#bookingSource').innerHTML = '<option value="">เลือกช่องทาง</option>'
      + (BOOKING.sources || []).map((x) => `<option>${esc(x)}</option>`).join('');

    /* --- ข้อมูลมัดจำ: QR ด้านบน แล้วตามด้วยธนาคาร / ชื่อบัญชี / เลขบัญชี --- */
    const dep = BOOKING.deposit || {};
    const depRows = [
      dep.bank && `<div><dt>ธนาคาร</dt><dd>${esc(dep.bank)}</dd></div>`,
      dep.accountName && `<div><dt>ชื่อบัญชี</dt><dd>${esc(dep.accountName)}</dd></div>`,
      dep.accountNo && `<div><dt>เลขบัญชี</dt><dd><strong>${esc(dep.accountNo)}</strong>
        <button type="button" class="copy-btn" data-copy="${esc(digits(dep.accountNo))}">คัดลอก</button></dd></div>`,
      dep.promptpay && `<div><dt>พร้อมเพย์</dt><dd><strong>${esc(dep.promptpay)}</strong></dd></div>`,
    ].filter(Boolean).join('');
    const depositHtml = [
      dep.note && `<p class="deposit__note">${esc(dep.note)}</p>`,
      dep.qr && `<figure class="deposit__qr">
        <img src="${esc(dep.qr)}" alt="QR พร้อมเพย์สำหรับโอนมัดจำ" width="600" height="600" loading="lazy" decoding="async">
        <figcaption>สแกนด้วยแอปธนาคาร · <a href="${esc(dep.qr)}" download="naaiprem-promptpay-qr.png">บันทึกรูป QR</a></figcaption>
      </figure>`,
      depRows && `<dl class="deposit__rows">${depRows}</dl>`,
    ].filter(Boolean).join('');
    $$('[data-deposit]').forEach((box) => { box.innerHTML = depositHtml; });
    section.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-copy]');
      if (!btn) return;
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'คัดลอกแล้ว ✓';
      } catch (err) {
        btn.textContent = btn.dataset.copy; // คัดลอกไม่ได้ → แสดงตัวเลขให้กดค้างคัดลอกเอง
      }
      setTimeout(() => { btn.textContent = 'คัดลอก'; }, 2200);
    });

    /* --- โหลดตารางว่าง (โหลดเมื่อเลื่อนใกล้ถึงส่วนจอง เพื่อไม่ให้หน้าแรกช้า) --- */
    async function loadAvailability() {
      el.cal.classList.add('is-loading');
      el.calStatus.textContent = 'กำลังโหลดตารางว่าง…';
      try {
        const res = await fetch(`${BOOKING.endpoint}?t=${Date.now()}`);
        const data = await res.json();
        if (!data.ok) throw new Error(data.error);
        avail = { busy: data.busy || {}, buffer: Number(data.buffer) || 0, minDate: data.minDate, maxDate: data.maxDate };
        el.calStatus.textContent = '';
      } catch (err) {
        el.calStatus.textContent = 'โหลดตารางว่างไม่สำเร็จ — ยังส่งคำขอได้ตามปกติ เราจะเช็กคิวให้อีกครั้ง';
      }
      el.cal.classList.remove('is-loading');
      if (state.date && dayState(state.date) !== 'free' && dayState(state.date) !== 'partial') state.date = null;
      renderCalendar();
      renderTime();
    }
    const preset = new URLSearchParams(location.search).get('type');
    const presetInput = preset && el.types.querySelector(`input[value="${CSS.escape(preset)}"]`);
    if (presetInput) {
      presetInput.checked = true;
      state.type = preset;
      renderPkgs();
    }
    renderCalendar();
    renderTime();
    new IntersectionObserver(([entry], io) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      loadAvailability();
    }, { rootMargin: '800px 0px' }).observe(section);

    /* --- สลิป: แสดงตัวอย่าง + ย่อรูปก่อนส่ง --- */
    $$('[data-slip-input]').forEach((input) => input.addEventListener('change', () => {
      const box = input.closest('.upload');
      const img = $('.upload__preview', box);
      box.classList.remove('is-invalid');
      if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
      const file = input.files[0];
      img.hidden = !file;
      if (file) img.src = URL.createObjectURL(file);
      else img.removeAttribute('src');
    }));

    async function readSlip(input) {
      const file = input.files[0];
      if (!file) return '';
      if (!file.type.startsWith('image/')) throw new Error('ไฟล์สลิปต้องเป็นรูปภาพ');
      const url = URL.createObjectURL(file);
      try {
        const img = await new Promise((ok, fail) => {
          const i = new Image();
          i.onload = () => ok(i);
          i.onerror = () => fail(new Error('เปิดรูปสลิปไม่ได้ ลองบันทึกเป็น JPG หรือ PNG แล้วเลือกใหม่'));
          i.src = url;
        });
        const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    async function post(payload) {
      let res;
      try {
        // ไม่ใส่ Content-Type เพื่อให้เป็น simple request (Apps Script ไม่รองรับ CORS preflight)
        res = await fetch(BOOKING.endpoint, { method: 'POST', body: JSON.stringify(payload) });
      } catch (err) {
        return { ok: false, error: 'ส่งไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่ หรือทักแชทเพจ NAAI PREM' };
      }
      try { return await res.json(); } catch (err) {
        // Google ตอบช้าตอนระบบเพิ่งตื่น — กดส่งซ้ำได้อย่างปลอดภัย (มีรหัสคำขอกันจองซ้ำ)
        return { ok: false, error: 'ระบบตอบกลับช้า กรุณากดส่งอีกครั้ง (ข้อมูลจะไม่ถูกบันทึกซ้ำ)' };
      }
    }

    /* --- ตรวจฟอร์ม --- */
    function fail(errorEl, message, focusEl, markEl = focusEl) {
      errorEl.textContent = message;
      markEl?.classList.add('is-invalid');
      focusEl?.focus({ preventScroll: true });
      (markEl || errorEl).scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' });
      return false;
    }
    [form, slipForm].forEach((f) => f.addEventListener('input', (e) => {
      e.target.classList.remove('is-invalid');
      e.target.closest('.is-invalid')?.classList.remove('is-invalid');
    }));

    function validateBooking(f) {
      const err = el.error;
      if (!state.type) return fail(err, 'กรุณาเลือกประเภทงาน', $('input', el.types), el.types);
      if (!currentPkg()) return fail(err, 'กรุณาเลือกรูปแบบการจอง', $('input', el.pkgs), el.pkgs);
      if (!state.date) return fail(err, 'กรุณาเลือกวันที่จากปฏิทิน', $('.cal__day:not(:disabled)', el.calGrid), el.cal);
      if (!selectedRanges()) return fail(err, 'กรุณาเลือกเวลาเริ่มที่ว่าง', el.start);
      if (f.elements.name.value.trim().length < 2) return fail(err, 'กรุณากรอกชื่อ-นามสกุล', f.elements.name);
      if (!/^0\d{8,9}$/.test(digits(f.elements.phone.value))) return fail(err, 'กรุณากรอกเบอร์โทรให้ถูกต้อง (9–10 หลัก)', f.elements.phone);
      if (!f.elements.place.value.trim()) return fail(err, 'กรุณากรอกสถานที่ถ่าย (ถ้ายังไม่แน่ใจ พิมพ์ว่า "ยังไม่แน่ใจ" ได้)', f.elements.place);
      if (!f.elements.province.value.trim()) return fail(err, 'กรุณากรอกจังหวัด', f.elements.province);
      if (!f.elements.source.value) return fail(err, 'กรุณาเลือกช่องทางที่รู้จักเรา', f.elements.source);
      if (!f.elements.consent.checked) return fail(err, 'กรุณายอมรับการเก็บข้อมูลเพื่อการนัดหมาย', f.elements.consent, f.elements.consent.closest('.check'));
      return true;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      el.error.textContent = '';
      if (!validateBooking(form)) return;

      el.submit.setAttribute('aria-busy', 'true');
      el.submit.textContent = 'กำลังส่ง…';
      try {
        const slipInput = $('[data-slip-input]', form);
        let slip = '';
        try { slip = await readSlip(slipInput); } catch (err) {
          fail(el.error, err.message, slipInput, slipInput.closest('.upload'));
          return;
        }
        const ranges = selectedRanges();
        const payload = {
          action: 'book',
          type: currentType().label,
          pkg: pkgLabel(),
          date: state.date,
          ranges,
          name: form.elements.name.value,
          phone: digits(form.elements.phone.value),
          contact: form.elements.contact.value,
          place: form.elements.place.value,
          province: form.elements.province.value,
          people: form.elements.people.value,
          source: form.elements.source.value,
          note: form.elements.note.value,
          consent: true,
          slip,
          website: form.elements.website.value,
          requestId,
        };
        const res = await post(payload);
        if (!res.ok) {
          el.error.textContent = res.error || 'ส่งไม่สำเร็จ กรุณาลองใหม่';
          if (res.code === 'conflict') { state.date = null; loadAvailability(); }
          return;
        }
        requestId = newRequestId();
        showDone(res.code, payload, Boolean(slip));
      } finally {
        el.submit.removeAttribute('aria-busy');
        el.submit.textContent = 'ส่งคำขอจองคิว';
      }
    });

    /* --- หน้าส่งสำเร็จ --- */
    function showDone(code, p, hasSlip) {
      const rows = [
        ['งาน', `${p.type} · ${p.pkg}`],
        ['วันที่', thaiDate(p.date)],
        ['เวลา', fmtRanges(p.ranges)],
        ['สถานที่', `${p.place} จ.${p.province}`],
        ['ชื่อ', p.name],
        ['เบอร์โทร', p.phone],
      ];
      done.innerHTML = `
        <p class="eyebrow">Thank you</p>
        <h3>ส่งคำขอจองเรียบร้อยแล้ว</h3>
        <p class="booking__code">${esc(code)}</p>
        <p class="booking__hint">รหัสจองของคุณ — แคปหน้าจอเก็บไว้ ใช้คู่กับเบอร์โทรตอนแนบสลิป</p>
        <dl class="booking__summary">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <p>${hasSlip
    ? 'ได้รับสลิปมัดจำแล้ว เราจะตรวจยอดและยืนยันคิวให้ภายใน 24 ชั่วโมง'
    : 'เราจะติดต่อกลับเพื่อยืนยันรายละเอียดภายใน 24 ชั่วโมง โอนมัดจำแล้วแนบสลิปได้ทันทีด้วยรหัสนี้'}</p>
        ${hasSlip ? '' : `<div class="deposit">${depositHtml}</div>`}
        <div class="booking__actions">
          ${hasSlip ? '' : '<button type="button" class="btn btn--primary" data-done="slip">แนบสลิปมัดจำ</button>'}
          <a class="btn btn--outline" href="${esc(CONTACT.messenger)}" target="_blank" rel="noopener">ทักแชทเพจ</a>
          <button type="button" class="btn btn--outline" data-done="again">จองคิวเพิ่ม</button>
        </div>`;
      layout.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      done.focus({ preventScroll: true });

      $('[data-done="slip"]', done)?.addEventListener('click', () => {
        slipBox.open = true;
        slipForm.elements.code.value = code;
        slipForm.elements.phone.value = p.phone;
        slipBox.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        $('summary', slipBox).focus({ preventScroll: true });
      });
      $('[data-done="again"]', done).addEventListener('click', () => {
        form.reset();
        Object.assign(state, { type: null, pkg: null, date: null });
        el.pkgs.innerHTML = '<p class="booking__hint">เลือกประเภทงานก่อน</p>';
        el.pkgStep.disabled = true;
        $('.upload__preview', form).hidden = true;
        done.hidden = true;
        layout.hidden = false;
        loadAvailability();
        section.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });
      });
    }

    /* --- แนบสลิปภายหลัง --- */
    slipForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('.booking__error', slipForm);
      const btn = $('button[type="submit"]', slipForm);
      const input = $('[data-slip-input]', slipForm);
      err.textContent = '';
      const code = slipForm.elements.code.value.trim().toUpperCase();
      if (!/^NP[A-Z0-9]{6}$/.test(code)) return fail(err, 'รหัสจองขึ้นต้นด้วย NP ตามด้วยตัวอักษร 6 ตัว', slipForm.elements.code);
      if (!/^0\d{8,9}$/.test(digits(slipForm.elements.phone.value))) return fail(err, 'กรุณากรอกเบอร์โทรที่ใช้จอง', slipForm.elements.phone);
      if (!input.files[0]) return fail(err, 'กรุณาเลือกรูปสลิป', input, input.closest('.upload'));

      btn.setAttribute('aria-busy', 'true');
      btn.textContent = 'กำลังส่ง…';
      try {
        let slip;
        try { slip = await readSlip(input); } catch (x) { return fail(err, x.message, input, input.closest('.upload')); }
        const res = await post({ action: 'slip', code, phone: digits(slipForm.elements.phone.value), slip });
        if (!res.ok) { err.textContent = res.error || 'ส่งไม่สำเร็จ กรุณาลองใหม่'; return; }
        slipForm.innerHTML = `<p class="booking__pick">ได้รับสลิปของรหัส <strong>${esc(code)}</strong> แล้ว ขอบคุณมากครับ
          เราจะตรวจยอดและยืนยันคิวให้เร็วที่สุด</p>`;
      } finally {
        btn.removeAttribute('aria-busy');
        btn.textContent = 'ส่งสลิป';
      }
    });
  }

  /* ---------- Start ---------- */
  if (typeof CONTACT === 'undefined' || typeof GALLERY === 'undefined') {
    console.error('naaiprem.foto: ไม่พบ js/data.js — ตรวจสอบว่าโหลด data.js ก่อน main.js');
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const lightbox = createLightbox();
  initAnchors();
  initContacts();
  initNav();
  initHeroBrand();
  initCover();
  initTiltRow();
  initGallery(lightbox);
  initStrip(lightbox);
  initStats();
  initServices();
  initBooking();
  initReviews();
  initFaq();
  initReveal(); // ต้องเรียกหลังสร้าง element จาก data (stats / reviews)
  initParallax();
  initCursor();
  initFab();
  initScrollFx();
})();
