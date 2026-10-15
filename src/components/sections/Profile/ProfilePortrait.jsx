import { useId, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../../../motion/scroll';
import './ProfilePortrait.css';

const photo = '/media/images/profile/tommy-portrait.png';
const illustration = '/media/images/profile/tommy-illustration.png';
// Conservative inset silhouette: neither the paper frame nor transparent gaps
// can receive paint. All layers use the original photo's coordinates.
const person = 'M 460 190 Q 478 85 595 88 Q 727 86 735 220 L 707 325 L 668 411 L 708 450 L 838 487 L 887 556 L 922 671 L 980 790 L 992 886 L 972 976 L 956 1070 L 981 1190 L 981 1220 L 518 1243 L 508 1330 L 490 1360 L 390 1342 L 351 1248 L 214 1246 L 246 1122 L 213 1012 L 187 908 L 198 806 L 217 701 L 240 574 L 332 515 L 435 458 L 467 415 L 451 341 L 440 276 Z';
const brush = 'M 690 143 C 568 109 480 166 486 215 C 490 270 380 406 350 490 C 316 584 718 562 791 650 C 906 790 374 843 355 998 C 335 1115 672 1124 789 1195';

export default function ProfilePortrait() {
  const id = useId().replaceAll(':', '');
  const root = useRef(null), stroke = useRef(null), completed = useRef(false);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const asset = new Image();
    let active = true;
    asset.onload = () => { if (active) setReady(true); };
    asset.src = illustration;
    return () => { active = false; asset.onload = null; };
  }, []);
  useLayoutEffect(() => {
    if (!ready) return;
    const media = gsap.matchMedia();
    media.add({ reduce: '(prefers-reduced-motion: reduce)', animate: '(prefers-reduced-motion: no-preference)' }, context => {
      const path = stroke.current;
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: completed.current || context.conditions.reduce ? 0 : length });
      if (completed.current || context.conditions.reduce) {
        completed.current = true;
        return;
      }
      gsap.to(path, {
        strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut',
        onComplete: () => { completed.current = true; },
        scrollTrigger: { id: 'profile-brush-entry', trigger: root.current, start: 'center 70%', once: true },
      });
    });
    return () => media.revert();
  }, [ready]);
  return <svg ref={root} className="profile-portrait" viewBox="0 0 1086 1448" role="img" aria-labelledby={`${id}-title`}>
    <title id={`${id}-title`}>주경덕 프로필 — 사진 위 S자 붓 자국 안에 드러나는 빈티지 채색 일러스트</title>
    <defs>
      <clipPath id={`${id}-person`}><path d={person}/></clipPath>
      <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".065" numOctaves="3" seed="12" result="grain"/>
        <feDisplacementMap in="SourceGraphic" in2="grain" scale="9" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <mask id={`${id}-brush`} maskUnits="userSpaceOnUse" x="0" y="0" width="1086" height="1448" style={{ maskType: 'luminance' }}>
        <path ref={stroke} className="profile-portrait__stroke" d={brush} fill="none" stroke="white" strokeWidth="145" strokeLinecap="round" filter={`url(#${id}-rough)`}/>
      </mask>
      <mask id={`${id}-protection`} maskUnits="userSpaceOnUse" x="0" y="0" width="1086" height="1448" style={{ maskType: 'luminance' }}>
        <rect width="1086" height="1448" fill="white"/><path d={person} fill="black"/>
      </mask>
    </defs>
    <image href={photo} width="1086" height="1448"/>
    <g clipPath={`url(#${id}-person)`}>
      <image href={illustration} width="1086" height="1448" preserveAspectRatio="none" mask={`url(#${id}-brush)`}/>
    </g>
    <image className="profile-portrait__frame-protection" href={photo} width="1086" height="1448" mask={`url(#${id}-protection)`}/>
  </svg>;
}
