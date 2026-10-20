// Audited against the section timelines AND CSS. Never use h2/p/* site-wide.
// Entire moving parents (data-reveal, pin tracks, scene copies) stay untouched.
export const textRevealManifest = [
  { selector: '#profile > .section-label, #work > .section-label, #zara .zara-overview__panel > .section-label, #clone > .section-label, #skills > .section-label, #about > .section-label', variant: 'label' },
  { selector: '#about .about__qa > h3', variant: 'subtitle' },
  { selector: '#clone > .clone-coding__note', variant: 'body' },
  { selector: '#zara-process > .research-archive__footer > span', variant: 'label' },
  // Stationary header only: chapter copies/tiles belong to the scrub timeline.
  { selector: '#diptyque-history .brand-history__header .section-label, #diptyque-history .brand-history__project > span', variant: 'label' },
  { selector: '#brand-history-title', variant: 'title', highlight: ':scope > em' },
  { selector: '#diptyque-history .brand-history__project > p', variant: 'body' },
  { selector: '#personal .personal-works__intro .section-label', variant: 'label' },
  { selector: '#personal-title', variant: 'title' },
  { selector: '#personal .personal-works__intro > div > p', variant: 'body' },
  { selector: '#film > .section-label, #film .film__introduction > span, #film .film__copy > .fine-print, #film .film__copy dt, #film .film__media-caption > span', variant: 'label' },
  { selector: '#film-title', variant: 'title' },
  { selector: '#film .film__copy h3', variant: 'subtitle' },
  { selector: '#film .film__introduction > p, #film .film__copy > p, #film .film__copy dd', variant: 'body' },
  { selector: '#film-archive .film-archive__header .section-label, #film-archive .film-archive__caption > span', variant: 'label' },
  { selector: '#film-archive-title', variant: 'title' },
  { selector: '#film-archive .film-archive__intro > p', variant: 'body' },
  { selector: '#closing > .section-label, #closing .memory-wall__eyebrow, #closing .memory-wall__rule > span', variant: 'label' },
  { selector: '#memory-wall-title', variant: 'title', highlight: ':scope > span' },
  { selector: '#closing .memory-wall__intro', variant: 'body' },
  { selector: '#contact .contact__heading .section-label, #contact .site-footer__bottom > span:first-child', variant: 'label' },
  { selector: '#contact-title', variant: 'title' },
  { selector: '#contact .site-footer__top h3, #contact .site-footer__bottom > span:nth-child(2)', variant: 'subtitle' },
  { selector: '#contact .site-footer__top p', variant: 'body' },
];
