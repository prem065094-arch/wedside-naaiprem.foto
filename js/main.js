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

  // เรียก fn(el) ครั้งเดียวเมื่อ element เลื่อนเข้ามาในจอ
  function onceVisible(els, fn, threshold = 0.6) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        fn(entry.target);
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

  /* ---------- 3) Hero: Crossfade สไลด์ ---------- */
  function initHero() {
    const hero = $('.hero');
    const slides = $$('.hero__slide');
    const bars = $('#heroBars');
    const indexEl = $('#heroIndex');
    const totalEl = $('#heroTotal');
    const labelEl = $('#heroLabel');
    if (!hero || !slides.length) return;

    const interval = SETTINGS.heroInterval || 6000;
    const pad = (n) => String(n).padStart(2, '0');
    hero.style.setProperty('--hero-interval', `${interval}ms`);
    bars.innerHTML = slides.map(() => '<span class="hero__bar"></span>').join('');
    if (totalEl) totalEl.textContent = pad(slides.length);
    const barEls = $$('.hero__bar', bars);

    let current = 0;
    let timer = null;
    let inView = true;
    const autoplay = slides.length > 1 && !reduceMotion();

    const schedule = () => {
      clearTimeout(timer);
      if (autoplay && inView && !document.hidden) timer = setTimeout(() => show(current + 1), interval);
    };

    function show(i) {
      slides[current].classList.remove('is-active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      barEls.forEach((bar, k) => {
        bar.classList.remove('is-active');
        bar.classList.toggle('is-done', k < current || (!autoplay && k === current));
      });
      if (autoplay) {
        void barEls[current].offsetWidth; // รีสตาร์ท animation ของแถบ
        barEls[current].classList.add('is-active');
      }
      indexEl.textContent = pad(current + 1);
      labelEl.textContent = slides[current].dataset.label || '';
      schedule();
    }

    show(0);
    if (!autoplay) return;

    // หยุดสไลด์เมื่อมองไม่เห็น Hero หรือสลับแท็บ (ประหยัดแบตเตอรี่)
    new IntersectionObserver(([entry]) => {
      const wasInView = inView;
      inView = entry.isIntersecting;
      if (inView && !wasInView) show(current);
      if (!inView) clearTimeout(timer);
    }).observe(hero);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimeout(timer);
      else show(current);
    });
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

    // ภาพค่อยๆ โผล่ขึ้นทีละภาพเมื่อเลื่อนมาเห็น
    const revealIO = reduceMotion() || !('IntersectionObserver' in window) ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealIO.unobserve(entry.target);
      });
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
    onceVisible($$('.stat__num', list), (el) => {
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
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    els.forEach((el) => io.observe(el));
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
      onceVisible(prices, (el) => countUp(el, Number(el.dataset.count), (n) => n.toLocaleString('en-US'), 1400), 0.8);
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

  /* ---------- Start ---------- */
  if (typeof CONTACT === 'undefined' || typeof GALLERY === 'undefined') {
    console.error('naaiprem.foto: ไม่พบ js/data.js — ตรวจสอบว่าโหลด data.js ก่อน main.js');
    $$('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const lightbox = createLightbox();
  initContacts();
  initNav();
  initHeroBrand();
  initHero();
  initGallery(lightbox);
  initStrip(lightbox);
  initStats();
  initServices();
  initReviews();
  initFaq();
  initReveal(); // ต้องเรียกหลังสร้าง element จาก data (stats / reviews)
  initParallax();
  initCursor();
  initFab();
  initScrollFx();
})();
