function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function memoryStackLayout(count) {
  return Array.from({ length: count }, (_, index) => ({
    x: 0, y: 0, rotation: ((index * 37 + 3) % 11) - 5,
    scale: .62, zIndex: index + 1,
  }));
}

// Use the rotated paper's real bounds, not its unrotated width. Every focused
// layout reserves an empty rectangle around the selected, enlarged card.
export function memoryLayout(width, height, dimensions, selected, revision) {
  const rng = random(9137 + revision * 7919);
  const count = dimensions.length;
  const gap = width > 1000 ? 56 : width > 600 ? 44 : 34;
  const focus = selected >= 0 ? dimensions[selected] : null;
  // Leave usable space around the enlarged selection in the shallow sky band.
  const focusScale = focus ? Math.min(1.42, width * (width < 600 ? .72 : .52) / focus.width, height * .60 / focus.height) : 1.42;
  const centerX = focus ? focus.width * focusScale / 2 : 0;
  const centerY = focus ? focus.height * focusScale / 2 : 0;
  const placed = [];
  const usage = [0, 0, 0, 0];
  const scatterAnchors = [[-.95, -.85], [.02, -.98], [.96, -.70], [-.98, .05], [.98, .16], [-.88, .94], [.08, .96], [.94, .93], [-.37, -.25], [.35, .35]];

  return dimensions.map((card, index) => {
    if (index === selected) return { x: 0, y: 0, rotation: 0, scale: focusScale, zIndex: count + 5 };
    const rotation = (rng() * 2 - 1) * 12;
    const radians = rotation * Math.PI / 180;
    const rotatedWidth = Math.abs(card.width * Math.cos(radians)) + Math.abs(card.height * Math.sin(radians));
    const rotatedHeight = Math.abs(card.height * Math.cos(radians)) + Math.abs(card.width * Math.sin(radians));
    let scale = .62, maxX, maxY, zones;
    for (let attempt = 0; attempt < 80; attempt++) {
      const halfWidth = rotatedWidth * scale / 2;
      const halfHeight = rotatedHeight * scale / 2;
      maxX = Math.max(0, width / 2 - halfWidth - 18);
      maxY = Math.max(0, height / 2 - halfHeight - 18);
      if (!focus) { zones = [{ x1: -maxX, x2: maxX, y1: -maxY, y2: maxY, side: 0 }]; break; }
      zones = [
        { x1: -maxX, x2: -centerX - halfWidth - gap, y1: -maxY, y2: maxY, side: 0 },
        { x1: centerX + halfWidth + gap, x2: maxX, y1: -maxY, y2: maxY, side: 1 },
        { x1: -maxX, x2: maxX, y1: -maxY, y2: -centerY - halfHeight - gap, side: 2 },
        { x1: -maxX, x2: maxX, y1: centerY + halfHeight + gap, y2: maxY, side: 3 },
      ].filter(zone => zone.x2 >= zone.x1 && zone.y2 >= zone.y1);
      if (zones.length) break;
      // Narrow tablet layouts may need smaller background cards, while the
      // selected card always retains its full size and focus scale.
      scale *= .96;
    }

    let best, bestScore = -Infinity;
    if (!focus) {
      const anchor = scatterAnchors[(index * 7) % scatterAnchors.length];
      best = {
        x: Math.max(-maxX, Math.min(maxX, anchor[0] * maxX + (rng() - .5) * maxX * .22)),
        y: Math.max(-maxY, Math.min(maxY, anchor[1] * maxY + (rng() - .5) * maxY * .22)),
        side: 0,
      };
    }
    for (let attempt = 0; attempt < 32; attempt++) {
      if (!focus) break;
      const zone = zones[Math.floor(rng() * zones.length)];
      const x = zone.x1 + rng() * (zone.x2 - zone.x1);
      const y = zone.y1 + rng() * (zone.y2 - zone.y1);
      const nearest = placed.length ? Math.min(...placed.map(point =>
        Math.hypot((point.x - x) / width, (point.y - y) / height))) : .5;
      // Favor open space without creating rows or identical side stacks.
      const outward = Math.hypot(x / Math.max(1, maxX), y / Math.max(1, maxY));
      const score = nearest + rng() * .055 - usage[zone.side] * .025 + outward * .08;
      if (score > bestScore) { bestScore = score; best = { x, y, side: zone.side }; }
    }
    placed.push(best);
    usage[best.side]++;
    return { x: best.x, y: best.y, rotation, scale, zIndex: 1 + Math.floor(rng() * count) };
  });
}
