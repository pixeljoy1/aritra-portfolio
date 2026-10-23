// Scroll-reveal: add .is-in once an element is 18% visible, then stop observing.
export function initReveal(selector: string) {
  const els = document.querySelectorAll<HTMLElement>(selector);
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((e) => e.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.18 });
  els.forEach((e) => io.observe(e));
}
