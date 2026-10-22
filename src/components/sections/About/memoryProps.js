const directory = '/media/images/about/memories/props';
export const memoryProps = [
  { id: 'palms', source: `${directory}/palms.png`, size: [1086, 1448], view: [0, 0, 1086, 1448], width: 166 },
  { id: 'film', source: `${directory}/film.png`, size: [1254, 1254], view: [0, 0, 1254, 1254], width: 156 },
  { id: 'camera', source: `${directory}/camera.png`, size: [1254, 1254], view: [0, 0, 1254, 1254], width: 154 },
  { id: 'clapper', source: `${directory}/clapper.png`, size: [1254, 1254], view: [0, 0, 1254, 1254], width: 140 },
  { id: 'script', source: `${directory}/script.png`, size: [1254, 1254], view: [0, 0, 1254, 1254], width: 125 },
  { id: 'light', source: `${directory}/light.png`, size: [1254, 1254], view: [285, 0, 780, 1254], width: 112 },
  { id: 'car', source: `${directory}/car.png`, size: [1448, 1086], view: [0, 190, 1448, 780], width: 194 },
  { id: 'mask', source: `${directory}/mask.png`, size: [1254, 1254], view: [0, 160, 1254, 940], width: 136 },
];

// Visual associations, not invented biographical facts. The car is a travel
// motif for the outdoor archive; it is not claimed to be pictured or owned.
export const memoryAssociations = {
  'memory-01': ['palms', 'car'],
  'memory-02': ['camera', 'script', 'mask'],
  'memory-03': ['camera', 'light', 'mask'],
  'memory-04': ['palms', 'mask'],
  'memory-05': ['palms', 'car'],
  'memory-06': ['camera', 'clapper', 'mask'],
  'memory-07': ['film', 'script', 'camera'],
  'memory-08': ['light', 'script', 'clapper'],
  'memory-09': ['camera', 'light', 'mask'],
  'memory-10': ['light', 'camera', 'film'],
};

export function memoryPropLayout(width, height, dimensions, focus, relatedIds, revision, photoLayout, focusId) {
  let seed = 3167 + revision * 1013;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const compact = width < 700;
  const anchors = [[-.84, -.86], [.05, -.9], [.86, -.28], [-.9, .22], [.88, .86], [-.48, .88], [-.83, -.22], [.35, .88]];
  return memoryProps.map((prop, index) => {
    const { width: w, height: h } = dimensions[index];
    const boundX = Math.max(0, width / 2 - w * .64 - 12);
    const boundY = Math.max(0, height / 2 - h * .64 - 12);
    const slot = relatedIds.indexOf(prop.id);
    const related = focus && slot >= 0;
    let x, y;
    if (related) {
      const cx = focus.width / 2, cy = focus.height / 2;
      // Foreground stickers visibly cross the paper corners rather than peeking
      // out from behind them. Keep the image's central subject unobstructed.
      const firstCorner = prop.id === 'camera'
        ? [-cx + w * .10, cy - h * .80]
        : focusId === 'memory-01' && prop.id === 'palms'
          ? [-cx - w * .28, -cy + h * .24]
          : [-cx + w * .10, -cy + h * .24];
      const positions = [firstCorner, [cx - w * .16, -cy + h * .22], [cx + w * .05, cy - h * .05]];
      [x, y] = positions[slot % positions.length];
    } else {
      const anchor = anchors[(index + revision * 3) % anchors.length];
      let bestScore = -Infinity;
      for (let attempt = 0; attempt < 48; attempt++) {
        const rawX = attempt % 2 ? (random() * 2 - 1) * (width - w * 1.3) / 2 : anchor[0] * (width - w) / 2 + (random() - .5) * width * .23;
        const rawY = attempt % 2 ? (random() * 2 - 1) * (height - h * 1.3) / 2 : anchor[1] * (height - h) / 2 + (random() - .5) * height * .20;
        const px = Math.max(-boundX, Math.min(boundX, rawX));
        const py = Math.max(-boundY, Math.min(boundY, rawY));
        const nearPhoto = Math.min(...photoLayout.map(photo => Math.hypot((px - photo.x) / width, (py - photo.y) / height)));
        const overlaps = photoLayout.reduce((total, photo) => {
          const angle = photo.rotation * Math.PI / 180;
          const halfWidth = (Math.abs(photo.width * Math.cos(angle)) + Math.abs(photo.height * Math.sin(angle))) * photo.scale / 2;
          const halfHeight = (Math.abs(photo.height * Math.cos(angle)) + Math.abs(photo.width * Math.sin(angle))) * photo.scale / 2;
          const overlapX = Math.max(0, Math.min(px + w / 2, photo.x + halfWidth) - Math.max(px - w / 2, photo.x - halfWidth));
          const overlapY = Math.max(0, Math.min(py + h / 2, photo.y + halfHeight) - Math.max(py - h / 2, photo.y - halfHeight));
          return total + overlapX * overlapY / (w * h);
        }, 0);
        const nearCenter = focus && Math.abs(px) < focus.width / 2 + w / 2 + 40 && Math.abs(py) < focus.height / 2 + h / 2 + 40;
        const anchorDistance = Math.hypot(px / width - anchor[0] / 2, py / height - anchor[1] / 2);
        const score = nearPhoto * .2 - overlaps * 2 - anchorDistance * .08 - (nearCenter ? 3 : 0);
        if (score > bestScore) { bestScore = score; x = px; y = py; }
      }
    }
    return {
      x: Math.max(-boundX, Math.min(boundX, x)), y: Math.max(-boundY, Math.min(boundY, y)),
      rotation: related ? [-14, 10, -8][slot % 3] : (random() * 2 - 1) * 22,
      scale: related ? 1.05 : .88, opacity: 1,
      zIndex: photoLayout.length + (related ? 20 : 10), related: Boolean(related),
      reactionScale: related && !compact ? 1.075 : 1.04,
    };
  });
}
