const directory = '/media/images/about/memories/frames';

// Original PNG pixel space. Trim empty outer margins using the SVG viewBox;
// keep the supplied paper, transparent edges and texture intact.
export const memoryFrames = {
  'portrait-clean': { source: `${directory}/portrait-clean.png`, size: [1122, 1402], paper: [62, 90, 998, 1255], opening: [139, 175, 845, 885], width: 218 },
  'portrait-soft': { source: `${directory}/portrait-soft.png`, size: [1122, 1402], paper: [62, 90, 998, 1255], opening: [137, 175, 847, 878], width: 218 },
  'portrait-teal': { source: `${directory}/portrait-teal.png`, size: [1086, 1448], paper: [62, 108, 964, 1242], opening: [128, 176, 834, 911], width: 214 },
  'landscape-clean': { source: `${directory}/landscape-clean.png`, size: [1402, 1122], paper: [96, 84, 1210, 966], opening: [154, 156, 1092, 704], width: 292 },
  'landscape-square': { source: `${directory}/landscape-square.png`, size: [1402, 1122], paper: [195, 84, 1010, 956], opening: [259, 161, 886, 675], width: 252 },
  'landscape-teal': { source: `${directory}/landscape-teal.png`, size: [1448, 1086], paper: [52, 78, 1346, 950], opening: [128, 158, 1186, 665], width: 310 },
};

export function memoryPresentation(memory) {
  const frame = memoryFrames[memory.frame] || memoryFrames['portrait-clean'];
  const [px, py, pw, ph] = frame.paper;
  const [x, y, width, height] = frame.opening;
  const windowAspect = width / height;
  const aspect = memory.aspect || 1;
  const zoom = memory.zoom || 1;
  const renderedWidth = Math.max(1, aspect / windowAspect) * zoom;
  const renderedHeight = Math.max(1, windowAspect / aspect) * zoom;
  const [focalX, focalY] = memory.focal || [.5, .5];
  const clamp = (value, size) => Math.max(1 - size, Math.min(0, value));
  return {
    frame,
    cardStyle: {
      '--card-width': `${frame.width}px`, '--card-height': `${frame.width * ph / pw}px`,
      '--photo-left': `${(x - px) / pw * 100}%`, '--photo-top': `${(y - py) / ph * 100}%`,
      '--photo-width': `${width / pw * 100}%`, '--photo-height': `${height / ph * 100}%`,
    },
    imageStyle: {
      width: `${renderedWidth * 100}%`, height: `${renderedHeight * 100}%`,
      left: `${clamp(.5 - focalX * renderedWidth, renderedWidth) * 100}%`,
      top: `${clamp(.5 - focalY * renderedHeight, renderedHeight) * 100}%`,
    },
  };
}
