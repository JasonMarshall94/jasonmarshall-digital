// Site-wide entrance motion, loaded on every page by BaseLayout. Nothing
// runs under prefers-reduced-motion, and GSAP only loads when it will be used.
//
// - [data-split]           homepage headline, revealed word by word
// - main h2 (+ its .label) section headings rise in as they scroll into view
// - .lift, [data-reveal]   cards and panels rise in, staggered in batches
// - [data-reveal-group]    each child rises in, staggered
// - [data-diagram]         service diagrams draw their lines on view
// - [data-timeline]        about timeline: lines draw across, dots pop in
// - .draw / .ring          CSS line drawings below the fold wait for view

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const inView = (el: Element) => el.getBoundingClientRect().top < window.innerHeight * 0.92;
// The page hero already animates in with .float-in
const inHero = (el: Element) => !!el.closest("main > :first-child");

if (!reduce) {
  // CSS line drawings start on page load, so pause the ones out of sight
  // straight away (before GSAP loads) and play them when they scroll in
  const waiting = new Set<SVGSVGElement>();
  document.querySelectorAll("main :is(.draw, .ring)").forEach((el) => {
    const svg = el.closest("svg");
    if (svg && !inView(svg) && !svg.matches("[data-diagram]")) waiting.add(svg);
  });
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.removeAttribute("data-await-view");
        io.unobserve(e.target);
      }),
    { rootMargin: "0px 0px -10% 0px" },
  );
  waiting.forEach((svg) => {
    svg.setAttribute("data-await-view", "");
    io.observe(svg);
  });

  init();
}

async function init() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  const ease = "expo.out";

  // ── Headline, word by word ───────────────────────────────────
  const headline = document.querySelector<HTMLElement>("[data-split]");
  if (headline) {
    const { SplitText } = await import("gsap/SplitText");
    gsap.registerPlugin(SplitText);
    const split = SplitText.create(headline, { type: "words", aria: "auto" });
    headline.dataset.split = "done";
    gsap.from(split.words, {
      opacity: 0,
      yPercent: 40,
      duration: 0.9,
      ease,
      stagger: 0.07,
      delay: 0.1,
      onComplete: () => split.revert(),
    });
  }

  // Elements already on screen are left alone: hiding them now would make
  // them flash out and back in
  const pending = (els: Element[]) => els.filter((el) => !inHero(el) && !inView(el));
  const rise = { opacity: 0, translate: "0 24px" };
  const settle = { opacity: 1, translate: "0 0", duration: 0.9, ease, clearProps: "opacity,translate" };

  // ── Section headings ─────────────────────────────────────────
  pending(gsap.utils.toArray<HTMLElement>("main h2")).forEach((h2) => {
    const label = h2.previousElementSibling?.matches(".label") ? h2.previousElementSibling : null;
    const parts = label ? [label, h2] : [h2];
    gsap.set(parts, rise);
    gsap.to(parts, {
      ...settle,
      stagger: 0.08,
      scrollTrigger: { trigger: h2, start: "top 90%", once: true },
    });
  });

  // ── Cards and panels ─────────────────────────────────────────
  // (Not the filterable work archive: hidden cards would never reveal)
  const cards = pending(
    gsap.utils
      .toArray<HTMLElement>("main :is(.lift, [data-reveal]), main [data-reveal-group] > *")
      .filter((el) => !el.closest("#project-grid")),
  );
  gsap.set(cards, rise);
  ScrollTrigger.batch(cards, {
    start: "top 92%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { ...settle, stagger: 0.1 }),
  });

  // ── Service diagrams draw on view ────────────────────────────
  document.querySelectorAll<SVGSVGElement>("[data-diagram]").forEach((svg) => {
    const shapes = Array.from(
      svg.querySelectorAll<SVGGeometryElement>("path, rect, line, polyline, circle, ellipse"),
    ).filter((el) => !el.matches(".draw, .flow, .bar, .ring"));
    const strokes = shapes.filter((el) => getComputedStyle(el).stroke !== "none");
    const fills = [
      ...shapes.filter((el) => !strokes.includes(el)),
      ...Array.from(svg.querySelectorAll("text")),
    ];
    strokes.forEach((el) => {
      const len = Math.ceil(el.getTotalLength?.() ?? 0);
      if (!len) return;
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
    });
    gsap.set(fills, { opacity: 0 });
    gsap
      .timeline({ scrollTrigger: { trigger: svg, start: "top 88%", once: true } })
      .to(strokes, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: "power2.inOut",
        stagger: 0.04,
        clearProps: "strokeDasharray,strokeDashoffset",
      })
      .to(fills, { opacity: 1, duration: 0.5, stagger: 0.03, clearProps: "opacity" }, 0.4);
  });

  // ── About timeline ───────────────────────────────────────────
  document.querySelectorAll<HTMLElement>("[data-timeline]").forEach((ol) => {
    const lines = ol.querySelectorAll("[data-tl-line]");
    const dots = ol.querySelectorAll("[data-tl-dot]");
    gsap.set(lines, { scaleX: 0 });
    gsap.set(dots, { scale: 0 });
    gsap
      .timeline({ scrollTrigger: { trigger: ol, start: "top 85%", once: true } })
      .to(lines, { scaleX: 1, duration: 0.9, ease: "power2.inOut", stagger: 0.18, clearProps: "transform" })
      .to(
        dots,
        { scale: 1, duration: 0.5, ease: "back.out(3)", stagger: 0.18, clearProps: "transform" },
        0.15,
      );
  });
}
