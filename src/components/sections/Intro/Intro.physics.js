export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Only stage edges constrain movement; text is never an obstacle.
export function constrainPoint(point, bounds) {
  return {x:clamp(point.x,bounds.left,bounds.right),y:clamp(point.y,bounds.top,bounds.bottom)};
}

export function advanceObject(state, seconds) {
  const dt=Math.min(seconds,.032);
  const next=constrainPoint({x:state.x+state.vx*dt,y:state.y+state.vy*dt},state.bounds);
  if(Math.abs(next.x-state.x-state.vx*dt)>.1)state.vx*=-.22;
  if(Math.abs(next.y-state.y-state.vy*dt)>.1)state.vy*=-.22;
  state.x=next.x;state.y=next.y;
  const friction=Math.exp(-4.6*dt);
  state.vx*=friction;state.vy*=friction;
  if(Math.abs(state.vx)<.5)state.vx=0;
  if(Math.abs(state.vy)<.5)state.vy=0;
}
