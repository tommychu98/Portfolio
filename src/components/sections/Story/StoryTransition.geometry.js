// Convert the rendered circle into each moving text line's local coordinate system.
export function circleMask(circle, line) {
  const radius = circle.width / 2;
  return `circle(${radius}px at ${circle.left + radius - line.left}px ${circle.top + circle.height / 2 - line.top}px)`;
}
