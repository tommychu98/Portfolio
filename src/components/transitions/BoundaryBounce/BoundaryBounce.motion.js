import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { gsap, ScrollTrigger } from '../../../motion/scroll';

gsap.registerPlugin(MorphSVGPlugin);

// Fixed endpoints and identical topology keep both directions seamless.
export function boundaryPath(bend) {
  return `M0,50 C200,50 300,${50 + bend} 500,${50 + bend} S800,50 1000,50 V50 H0 Z`;
}

export function bounceSettings(velocity, direction = 1) {
  const speed = Math.min(Math.abs(velocity), 6000);
  const strength = Math.sqrt(speed / 6000);
  return {
    bend: (Math.sign(velocity) || direction) * (12 + 14 * strength),
    duration: 1.6 + .35 * strength,
    ease: `elastic.out(${1.1 + .25 * strength}, ${.55 - .12 * strength})`,
  };
}

// Adapted from https://codepen.io/GreenSock/pen/bGeZvpO
// The original uses onEnter + velocity-controlled elastic morphing. Here both
// viewport entries and in-view direction changes work without resetting a path.
export function initBoundaryBounce(root, id) {
  const paths = [...root.querySelectorAll('path')];
  const flat = boundaryPath(0);
  const media = gsap.matchMedia();
  media.add('all', () => {
    let tween;
    let lastDirection = 0;
    let peakSpeed = 0;
    let lastImpulse = -Infinity;
    const reset = () => {
      tween?.kill();
      gsap.set(paths, { morphSVG: flat });
      lastDirection = 0;
      peakSpeed = 0;
      lastImpulse = -Infinity;
    };
    const bounce = self => {
      const velocity = self.getVelocity();
      if (Math.abs(velocity) < 25 || ScrollTrigger.isRefreshing) return;
      const settings = bounceSettings(velocity, self.direction);
      lastDirection = Math.sign(velocity);
      peakSpeed = Math.abs(velocity);
      lastImpulse = performance.now();
      tween?.kill();
      tween = gsap.timeline().to(paths, {
        morphSVG: boundaryPath(settings.bend), duration: .12,
        ease: 'power2.out', overwrite: 'auto',
      }).to(paths, {
        morphSVG: flat, duration: settings.duration, ease: settings.ease,
        overwrite: 'auto',
      });
    };
    const trigger = ScrollTrigger.create({
      id: `boundary-${id}`, trigger: root,
      start: 'top bottom', end: 'top top',
      onEnter: bounce, onEnterBack: bounce,
      onUpdate: self => {
        if (!self.isActive) return;
        const velocity = self.getVelocity();
        const speed = Math.abs(velocity);
        const reversed = speed > 80 && Math.sign(velocity) !== lastDirection;
        const accelerated = speed > Math.max(300, peakSpeed * 1.6);
        const settled = !tween?.isActive() && speed > 120;
        if (performance.now() - lastImpulse > 160 && (reversed || accelerated || settled)) bounce(self);
      },
      onLeave: reset, onLeaveBack: reset, onRefresh: reset,
    });
    return () => { trigger.kill(); tween?.kill(); paths.forEach(path => path.setAttribute('d', flat)); };
  });
  return () => media.revert();
}
