// Shared display order. IDs and project URLs remain independent of numbering.
export const sectionOrder = [
  'intro', 'story', 'values', 'profile', 'work', 'zara', 'zara-details',
  'zara-process', 'diptyque-history', 'personal', 'film', 'film-archive',
  'clone', 'skills', 'about', 'closing', 'contact',
];

export function sectionNumber(id) {
  const index = sectionOrder.indexOf(id.replace(/^#/, ''));
  return index < 0 ? '' : String(index + 1).padStart(2, '0');
}
