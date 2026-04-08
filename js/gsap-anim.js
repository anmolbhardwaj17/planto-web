// Wait for GSAP to load (it's deferred)
window.addEventListener("load", () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Strip the CSS-based .reveal so GSAP can read real end-state values.
  // The IntersectionObserver fallback in main.js relies on .reveal — by removing
  // the class here, GSAP becomes the sole driver.
  document.querySelectorAll(".reveal").forEach((el) => {
    el.classList.remove("reveal");
    el.style.opacity = "";
    el.style.transform = "";
  });

  // ---------- HERO: split H1 into words ----------
  const h1 = document.querySelector(".hero h1");
  if (h1) {
    const html = h1.innerHTML.replace(/<br\s*\/?>/g, " <br> ");
    const tokens = html.split(/\s+/).filter(Boolean);
    h1.innerHTML = tokens
      .map((t) => (t === "<br>" ? "<br/>" : `<span class="word"><span class="word-inner">${t}</span></span>`))
      .join(" ");
  }

  // ---------- HERO entrance master timeline ----------
  // Reveal hero items now that GSAP is about to register from-states.
  // .from() with default immediateRender locks them at start values, so
  // flipping visibility on right after avoids any flash.
  gsap.set(
    ".hero .eyebrow, .hero h1, .hero .lede, .hero .cta-row, .hero .deco",
    { visibility: "visible" }
  );

  const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });

  heroTl
    .from(".hero .eyebrow", {
      y: -20,
      opacity: 0,
      duration: 0.7,
      scale: 0.85,
    })
    .from(
      ".hero h1 .word-inner",
      {
        yPercent: 120,
        rotation: 6,
        opacity: 0,
        duration: 1.1,
        stagger: 0.08,
      },
      "-=0.35"
    )
    .from(
      ".hero .lede",
      { y: 24, opacity: 0, duration: 0.8 },
      "-=0.55"
    )
    .from(
      ".hero .cta-row",
      { y: 24, opacity: 0, duration: 0.8 },
      "-=0.6"
    )
    .from(
      ".hero .scene-card",
      {
        y: 80,
        opacity: 0,
        rotation: -4,
        scale: 0.92,
        duration: 1.2,
        ease: "expo.out",
      },
      "-=0.9"
    )
    .from(
      ".hero .deco",
      {
        scale: 0,
        rotation: "random(-90, 90)",
        opacity: 0,
        duration: 0.8,
        stagger: { each: 0.06, from: "random" },
        ease: "back.out(2)",
      },
      "-=1"
    );

  // ---------- HERO scene-card 3D tilt ----------
  const scene = document.querySelector(".hero .scene-card");
  if (scene) {
    const setX = gsap.quickTo(scene, "rotationY", { duration: 0.6, ease: "power3.out" });
    const setY = gsap.quickTo(scene, "rotationX", { duration: 0.6, ease: "power3.out" });
    gsap.set(scene, { transformPerspective: 900, transformOrigin: "center" });

    scene.addEventListener("mousemove", (e) => {
      const r = scene.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      setX(px * 18);
      setY(-py * 18);
    });
    scene.addEventListener("mouseleave", () => {
      setX(0);
      setY(0);
    });
  }

  // ---------- HERO mouse parallax on decorations ----------
  const heroSec = document.querySelector(".hero");
  if (heroSec) {
    const decos = heroSec.querySelectorAll(".deco");
    decos.forEach((d, i) => {
      d.dataset.depth = (i % 3) * 6 + 6;
    });
    heroSec.addEventListener("mousemove", (e) => {
      const r = heroSec.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      decos.forEach((d) => {
        const depth = +d.dataset.depth;
        gsap.to(d, {
          x: px * depth,
          y: py * depth,
          duration: 0.8,
          ease: "power3.out",
          overwrite: "auto",
        });
      });
    });
  }

  // ---------- HERO scroll exit (pin + scrub) ----------
  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
    animation: gsap.timeline()
      .to(".hero .scene-card", { y: -100, scale: 0.95, ease: "none" }, 0)
      .to(".hero h1", { y: -40, ease: "none" }, 0)
      .to(".hero .lede", { y: -30, ease: "none" }, 0)
      .to(".hero .cta-row", { y: -20, ease: "none" }, 0)
      .to(".hero .deco", { y: -60, ease: "none" }, 0),
  });

  // ---------- MARQUEE infinite loop ----------
  const track = document.querySelector(".marquee-track");
  if (track) {
    // Duplicate content so the loop is seamless
    track.innerHTML += track.innerHTML;
    const totalWidth = track.scrollWidth / 2;
    gsap.to(track, {
      x: -totalWidth,
      duration: 38,
      ease: "none",
      repeat: -1,
    });

    // Scroll-linked speed kick
    ScrollTrigger.create({
      trigger: ".marquee-section",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        gsap.to(track, {
          timeScale: 1 + Math.abs(self.getVelocity()) / 4000,
          duration: 0.4,
          overwrite: "auto",
        });
      },
    });
  }

  // ---------- CAST tile entrance ----------
  gsap.from(".tile", {
    scrollTrigger: {
      trigger: ".cast",
      start: "top 75%",
    },
    y: 80,
    opacity: 0,
    duration: 1,
    ease: "expo.out",
    stagger: { each: 0.1, from: "start" },
  });


  // ---------- SECTION HEADERS ----------
  gsap.utils.toArray(".section-head").forEach((head) => {
    gsap.from(head.children, {
      scrollTrigger: { trigger: head, start: "top 85%" },
      y: 60,
      opacity: 0,
      duration: 1,
      stagger: 0.12,
      ease: "expo.out",
    });
  });

  // ---------- FEATURES ----------
  gsap.from(".feature", {
    scrollTrigger: { trigger: ".features-section", start: "top 75%" },
    y: 60,
    opacity: 0,
    duration: 0.9,
    stagger: 0.1,
    ease: "expo.out",
  });

  // ---------- INSTALL ----------
  gsap.from(".install h2", {
    scrollTrigger: { trigger: ".install", start: "top 80%" },
    y: 80,
    opacity: 0,
    scale: 0.85,
    duration: 1.1,
    ease: "expo.out",
  });
  gsap.from(".install .lede, .install .get-started", {
    scrollTrigger: { trigger: ".install", start: "top 75%" },
    y: 40,
    opacity: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: "expo.out",
  });

  // ---------- FOOTER signoff ----------
  gsap.from("footer .signoff", {
    scrollTrigger: { trigger: "footer", start: "top 85%" },
    y: 60,
    opacity: 0,
    scale: 0.9,
    duration: 1.1,
    ease: "expo.out",
  });

  // ---------- MAGNETIC CTA buttons ----------
  document.querySelectorAll(".get-started").forEach((btn) => {
    if (btn.classList.contains("float-cta")) return; // skip the fixed one
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const px = e.clientX - r.left - r.width / 2;
      const py = e.clientY - r.top - r.height / 2;
      gsap.to(btn, { x: px * 0.18, y: py * 0.25, duration: 0.5, ease: "power3.out" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
    });
  });

  ScrollTrigger.refresh();
});
