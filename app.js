(() => {
  const B = window.BRAND, $ = (s) => document.querySelector(s);
  const wa = (t) => `https://wa.me/${B.wa}?text=${encodeURIComponent(t)}`;
  const hello = "أهلاً، عايزة أسأل عن منتج عندكم";
  ["#hdrWa", "#navWa", "#heroWa", "#cWa", "#fab"].forEach((s) => ($(s).href = wa(hello)));
  $("#addr").textContent = B.address;
  $("#tel").textContent = B.phone; $("#tel").href = "tel:" + B.phone;
  $("#mapA").href = B.map; $("#fb").href = B.facebook;

  // mobile menu
  const mb = $("#menuBtn"), nav = $("#nav");
  const setMenu = (o) => { nav.classList.toggle("open", o); mb.setAttribute("aria-expanded", o); };
  mb.onclick = () => setMenu(!nav.classList.contains("open"));
  nav.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));

  // products
  let cat = "all", q = "";
  const tabs = [{ k: "all", n: "الكل" }, ...B.cats];
  $("#tabs").innerHTML = tabs.map((t) => `<button role="tab" data-k="${t.k}" class="${t.k === "all" ? "on" : ""}">${t.n}</button>`).join("");
  $("#tabs").onclick = (e) => { const b = e.target.closest("button"); if (!b) return; cat = b.dataset.k; [...$("#tabs").children].forEach((x) => x.classList.toggle("on", x === b)); draw(); };
  $("#searchForm").onsubmit = (e) => { e.preventDefault(); $("#shop").scrollIntoView({ behavior: "smooth" }); };
  $("#q").oninput = (e) => { q = e.target.value.trim().toLowerCase(); draw(); if (q) $("#shop").scrollIntoView({ behavior: "smooth" }); };

  function draw() {
    const list = B.products.filter((p) => (cat === "all" || p.cat === cat) && (!q || (p.name + p.brand + p.text).toLowerCase().includes(q)));
    $("#grid").innerHTML = list.map((p) => `
      <article class="card" data-id="${p.id}">
        <button class="card-img" aria-label="${p.name}"><img src="img/p/${p.id}-m.webp" alt="${p.name}" loading="lazy"></button>
        <div class="card-b"><span class="brandline">${p.brand}</span><h3>${p.name}</h3>
          <a class="btn btn-sm btn-wa" target="_blank" rel="noopener" href="${wa("عايزة أسأل عن: " + p.name)}">اسألي عن السعر</a></div>
      </article>`).join("");
    $("#count").textContent = list.length + " منتج";
    $("#empty").hidden = list.length > 0;
  }
  $("#grid").onclick = (e) => {
    if (e.target.closest("a")) return;
    const c = e.target.closest(".card"); if (!c) return;
    const p = B.products.find((x) => x.id === c.dataset.id);
    $("#dImg").src = `img/p/${p.id}-l.webp`; $("#dImg").alt = p.name;
    $("#dBrand").textContent = p.brand; $("#dName").textContent = p.name; $("#dText").textContent = p.text;
    $("#dWa").href = wa("عايزة أسأل عن: " + p.name);
    $("#dlg").showModal();
  };
  $("#dlgX").onclick = () => $("#dlg").close();
  $("#dlg").addEventListener("click", (e) => e.target === $("#dlg") && $("#dlg").close());
  draw();

  $("#faqList").innerHTML = B.faqs.map(([q, a]) => `<details class="rv"><summary>${q}</summary><p>${a}</p></details>`).join("");

  // reveal on scroll
  const els = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((en) => en.forEach((x) => x.isIntersecting && (x.target.classList.add("in"), io.unobserve(x.target))), { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  } else els.forEach((e) => e.classList.add("in"));
})();
