(() => {
  const root = document.documentElement, $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

  // ---- loader -> hero entrance
  const loader = $("#loader");
  let done = false;
  const start = () => {
    if (done) return; done = true;
    loader && loader.classList.add("gone");
    root.classList.remove("loading");
    root.classList.add("ready");
    setTimeout(countUp, 900);
  };
  if (reduce) start();
  else {
    const minShow = new Promise((r) => setTimeout(r, 1700));
    const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r)));
    Promise.all([minShow, loaded]).then(start);
    setTimeout(start, 4500); // never trap the visitor
  }

  // ---- count-up numbers
  function countUp() {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const to = +el.dataset.count, suf = el.dataset.suffix || "";
      if (reduce) return (el.textContent = to + suf);
      const t0 = performance.now(), dur = 1400;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // ---- scroll progress + sticky header + hero parallax (one rAF-throttled listener)
  const bar = $("#progress"), header = $(".header"), art = $(".hero-art");
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, max = root.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header && header.classList.toggle("stuck", y > 30);
    if (art && !reduce && y < innerHeight) art.style.translate = `0 ${y * -0.06}px`;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // ---- stagger reveals inside grids
  document.querySelectorAll(".svc-grid,.why-grid").forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty("--d", i * 0.09 + "s")));
  const grid = $("#grid");
  const stagger = () => grid && [...grid.children].forEach((c, i) => { c.style.setProperty("--d", (i % 4) * 0.08 + "s"); c.classList.add("rv"); });
  // cards are re-rendered by app.js on filter; re-observe them
  if (grid && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((en) => en.forEach((x) => x.isIntersecting && (x.target.classList.add("in"), io.unobserve(x.target))), { threshold: 0.1 });
    const watch = () => { stagger(); [...grid.children].forEach((c) => { c.classList.remove("in"); io.observe(c); }); };
    new MutationObserver(watch).observe(grid, { childList: true });
    watch();
  }

  // ---- 3D tilt on product cards (desktop pointer only)
  if (fine && !reduce && grid) {
    grid.addEventListener("pointermove", (e) => {
      const c = e.target.closest(".card"); if (!c) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.classList.add("tilt");
      c.style.transform = `perspective(800px) rotateY(${x * -8}deg) rotateX(${y * 8}deg) translateY(-4px)`;
    });
    grid.addEventListener("pointerout", (e) => {
      const c = e.target.closest(".card"); if (!c) return;
      c.classList.remove("tilt"); c.style.transform = "";
    });
  }

  // ---- hero art follows the pointer a little
  if (fine && !reduce && art) {
    const hero = $(".hero");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      art.querySelectorAll(".art-card").forEach((c, i) => { c.style.marginInlineStart = x * (14 + i * 8) + "px"; c.style.marginBlockStart = y * (10 + i * 6) + "px"; });
    });
  }

  // ---- button ripple
  document.addEventListener("pointerdown", (e) => {
    const b = e.target.closest(".btn"); if (!b || reduce) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height), d = document.createElement("span");
    d.className = "ripple";
    d.style.cssText = `inline-size:${s}px;block-size:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.append(d); setTimeout(() => d.remove(), 650);
  });
})();
