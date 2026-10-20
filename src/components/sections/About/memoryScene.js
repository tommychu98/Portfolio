// Coordinates measured in the supplied, unedited 1024 × 1536 illustration.
// A full-width sky band is safer than routing cards around the figure: every
// straight GSAP path remains above the figure, even when interrupted.
export const desertScene = {
  source: '/media/images/about/memories/la-desert-background.png',
  width: 1024, height: 1536,
  sky: { left: .035, top: .035, right: .965, bottom: .64 },
  person: { left: .445, top: .713, right: .555, bottom: .912 },
};

export function sceneGeometry(root, stage, heading) {
  const r = root.getBoundingClientRect(), s = stage.getBoundingClientRect();
  const frame = root.querySelector('.memory-wall__desert').getBoundingClientRect();
  const scale = Math.min(frame.width / desertScene.width, frame.height / desertScene.height);
  const width = desertScene.width * scale, height = desertScene.height * scale;
  const image = { left: frame.left - r.left + (frame.width - width) / 2, top: frame.bottom - r.top - height, width, height };
  const map = rect => ({ left: image.left + rect.left * width, top: image.top + rect.top * height,
    right: image.left + rect.right * width, bottom: image.top + rect.bottom * height });
  const sky = map(desertScene.sky), person = map(desertScene.person);
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
