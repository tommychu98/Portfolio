// Person, ground and shadow share one photographic coordinate system.
// The invisible SVG bounds reserve room for the embedded subject.
export const desertScene = {
  source: '/media/images/about/memories/la-desert-composed-v4.png',
  width: 1536, height: 1024,
};

export function sceneGeometry(root, stage, heading) {
  const r = root.getBoundingClientRect(), s = stage.getBoundingClientRect();
  const frame = root.querySelector('.memory-wall__sky').getBoundingClientRect();
  const landscape = root.querySelector('.memory-wall__desert').getBoundingClientRect();
  const figure = root.querySelector('.memory-wall__person').getBoundingClientRect();
  const image = { left: frame.left-r.left, top: frame.top-r.top, width: frame.width, height: frame.height };
  const person = { left: figure.left-r.left, top: figure.top-r.top, right: figure.right-r.left, bottom: figure.bottom-r.top };
  const gutter = Math.max(18, r.width * .035);
  const sky = { left: gutter, right: r.width-gutter, top: 0,
    bottom: Math.min(landscape.top-r.top+landscape.height*.12,person.top-36) };
  const origin = { x: s.left - r.left + s.width / 2, y: s.top - r.top + s.height / 2 };
  sky.top = Math.max(sky.top, heading.getBoundingClientRect().bottom - r.top + 18);
  sky.bottom = Math.min(sky.bottom, s.bottom - r.top);
  return { image, person, sky, width: sky.right - sky.left, height: sky.bottom - sky.top,
    x: (sky.left + sky.right) / 2 - origin.x, y: (sky.top + sky.bottom) / 2 - origin.y };
}

// Reserve a rotation-independent circle around every rectangle. Its radius is
// conservative for ALL intermediate angles, scales and inner sticker pulses.
export function constrainToSky(layout, dimensions, area, maxScale = Infinity, pulse = 1) {
  return layout.map((target, i) => {
    const radius = Math.hypot(dimensions[i].width, dimensions[i].height) / 2 * pulse;
    const scale = Math.max(.01, Math.min(target.scale, maxScale, (area.width - 24) / (radius * 2), (area.height - 24) / (radius * 2)));
    const boundX = Math.max(0, area.width / 2 - radius * scale - 12);
    const boundY = Math.max(0, area.height / 2 - radius * scale - 12);
    return { ...target, scale, x: area.x + Math.max(-boundX, Math.min(boundX, target.x)),
      y: area.y + Math.max(-boundY, Math.min(boundY, target.y)) };
  });
}
