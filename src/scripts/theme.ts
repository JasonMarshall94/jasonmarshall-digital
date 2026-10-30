// Theme controls: the header icon ([data-theme-toggle]) and the
// System · Light · Dark buttons ([data-theme-mode]) in the footer and the
// mobile drawer. The initial theme is applied by the inline script in
// BaseLayout <head>; localStorage.theme holds an explicit choice, and no
// stored value means "follow the OS".
type Theme = "light" | "dark";
type Mode = Theme | "system";

const root = document.documentElement;
const media = window.matchMedia("(prefers-color-scheme: dark)");
const system = (): Theme => (media.matches ? "dark" : "light");
const current = (): Theme => (root.dataset.theme as Theme | undefined) ?? system();

const stored = (): Mode => {
  try {
    const t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") return t;
  } catch {}
  return "system";
};

const apply = (mode: Mode) => {
  try {
    if (mode === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", mode);
  } catch {}
  if (mode === "system") delete root.dataset.theme;
  else root.dataset.theme = mode;
  sync();
};

const sync = () => {
  const next = current() === "dark" ? "light" : "dark";
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")
    .forEach((btn) => {
      btn.querySelector("[data-theme-label]")!.textContent = `Switch to ${next} theme`;
    });
  const mode = stored();
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-mode]")
    .forEach((btn) =>
      btn.setAttribute("aria-pressed", String(btn.dataset.themeMode === mode)),
    );
};

// The icon flips the theme; an explicit choice is only stored when it
// differs from the OS, so flipping back to match the OS resumes following it
document
  .querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")
  .forEach((btn) =>
    btn.addEventListener("click", () => {
      const next: Theme = current() === "dark" ? "light" : "dark";
      apply(next === system() ? "system" : next);
    }),
  );

document
  .querySelectorAll<HTMLButtonElement>("[data-theme-mode]")
  .forEach((btn) =>
    btn.addEventListener("click", () => apply(btn.dataset.themeMode as Mode)),
  );

media.addEventListener("change", sync);
sync();
