import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../../motion/scroll';
import SectionLabel from '../../ui/SectionLabel';
import { memories } from './memories';
import { memoryPresentation } from './memoryFrames';
import { memoryLayout, memoryStackLayout } from './MemoryWall.layout';
import { memoryProps, memoryAssociations, memoryPropLayout } from './memoryProps';
import { desertScene, sceneGeometry, constrainToSky } from './memoryScene';
import './MemoryWall.css';

export default function MemoryWall() {
  const root = useRef(null);
  const stage = useRef(null);
  const cards = useRef(new Map());
  const props = useRef(new Map());
  const controls = useRef(null);
  const [selected, setSelected] = useState(-1);
  const [back, setBack] = useState(false);

  useLayoutEffect(() => {
    let active = -1, reversed = false, revision = 0, timeline, lifecycle;
    let phase = 'stacked', expanded = false, disposed = false, currentArea;
    let advanceTimer;
    const nodes = memories.map(memory => cards.current.get(memory.id));
    const propNodes = memoryProps.map(prop => props.current.get(prop.id));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ctx = gsap.context(() => {}, root);
    const faces = nodes.flatMap(node => [...node.querySelectorAll('[data-memory-face]')]);
    const arts = propNodes.map(node => node.querySelector('svg'));
    const stopAdvance = () => {
      window.clearTimeout(advanceTimer);
      advanceTimer = undefined;
    };
    const prepareAdvance = () => {
      stopAdvance();
      if (disposed || !expanded || active < 0 || reversed || phase !== 'focused' || document.hidden) return;
      advanceTimer = window.setTimeout(() => {
        advanceTimer = undefined;
        ctx.focusMemory((active + 1) % nodes.length);
      }, 5000);
    };
    const setPhase = value => {
      phase = value;
      root.current.dataset.memoryState = value;
      if (value === 'focused') prepareAdvance();
      else stopAdvance();
    };
    const resetSelection = () => {
      stopAdvance();
      gsap.killTweensOf(faces);
      gsap.set(root.current.querySelectorAll('[data-memory-face="front"]'), { autoAlpha: 1, scale: 1 });
      gsap.set(root.current.querySelectorAll('[data-memory-face="back"]'), { autoAlpha: 0, scale: .97 });
      active = -1; reversed = false;
      setSelected(-1); setBack(false);
    };

    ctx.add('arrange', (kind = 'focus', animate = true) => {
      timeline?.kill();
      gsap.killTweensOf(arts);
      const stack = kind === 'stack' || kind === 'gather';
      const area = sceneGeometry(root.current, stage.current, root.current.querySelector('.memory-wall__rule'));
      const dimensions = nodes.map(node => ({ width: node.offsetWidth, height: node.offsetHeight }));
      const propDimensions = propNodes.map(node => ({ width: node.offsetWidth, height: node.offsetHeight }));
      const rawLayout = stack ? memoryStackLayout(nodes.length) : memoryLayout(area.width, area.height, dimensions, active, revision);
      const layout = constrainToSky(rawLayout, dimensions, area, Infinity, 1.04);
      const localPhotos = layout.map((photo, i) => ({ ...photo, x: photo.x - area.x, y: photo.y - area.y, ...dimensions[i] }));
      const rawProps = memoryPropLayout(area.width, area.height, propDimensions,
        active >= 0 ? { width: dimensions[active].width * layout[active].scale, height: dimensions[active].height * layout[active].scale } : null,
        memoryAssociations[memories[active]?.id] || [], revision,
        localPhotos, memories[active]?.id);
      const propLayout = constrainToSky(rawProps, propDimensions, area, area.width < 600 ? .65 : .85, 1.15);
      // A resize changes the legal region itself. Reproject old transforms into
      // its new safe band before continuing, rather than tweening from the ground.
      if (currentArea && (currentArea.width !== area.width || currentArea.height !== area.height || currentArea.y !== area.y)) {
        [...nodes, ...propNodes].forEach((node, i) => {
          const dimensions = i < nodes.length ? { width: node.offsetWidth, height: node.offsetHeight } : propDimensions[i - nodes.length];
          const target = { x: +gsap.getProperty(node, 'x') - area.x, y: +gsap.getProperty(node, 'y') - area.y,
            rotation: +gsap.getProperty(node, 'rotation'), scale: +gsap.getProperty(node, 'scaleX') };
          gsap.set(node, constrainToSky([target], [dimensions], area, Infinity, i < nodes.length ? 1.04 : 1.15)[0]);
        });
      }
      currentArea = area;
      const immediate = reduced.matches || !animate;
      const duration = immediate ? 0 : kind === 'scatter' ? 1.28 : kind === 'gather' ? 1.02 : .86;
      const settledPhase = stack ? 'stacked' : active >= 0 ? 'focused' : 'scattered';
      setPhase(immediate ? settledPhase : kind === 'gather' ? 'gathering' : kind === 'scatter' ? 'scattering' : 'focusing');
      timeline = gsap.timeline({ paused: true, defaults: { duration, ease: 'power3.inOut', overwrite: 'auto' },
        onComplete: () => { if (!disposed) setPhase(settledPhase); },
      });
      let order = 0;
      nodes.forEach((node, i) => {
        const { zIndex, ...transform } = layout[i];
        node.style.setProperty('--memory-focus-scale', layout[i].scale);
        gsap.set(node, { zIndex });
        const delay = immediate ? 0 : kind === 'scatter' ? i * .055 : kind === 'gather' ? i * .035 : i === active ? .04 : Math.min(order++ * .03, .24);
        timeline.to(node, transform, delay);
      });
      propNodes.forEach((node, i) => {
        const { zIndex, related, reactionScale, ...transform } = propLayout[i];
        gsap.set(node, { zIndex });
        timeline.to(node, transform, immediate ? 0 : .02 + i * .018);
        const art = node.querySelector('svg');
        timeline.to(art, { scale: reversed && related ? .96 : 1, rotation: reversed && related ? (i % 2 ? -4 : 4) : 0, duration: immediate ? 0 : .2 }, 0);
        if (related && kind === 'focus' && !immediate) {
          timeline.to(art, { scale: reactionScale, rotation: i % 2 ? 3 : -3, duration: .18, ease: 'power2.out' }, .60)
            .to(art, { scale: 1, rotation: 0, duration: .28, ease: 'power2.inOut' }, .78);
        }
      });
      if (immediate) timeline.progress(1);
      else timeline.play(0);
    });

    ctx.add('scatter', () => {
      if (expanded) return;
      expanded = true;
      revision = 0;
      resetSelection();
      active = 0;
      setSelected(0);
      ctx.arrange('scatter');
    });

    ctx.add('gather', () => {
      if (!expanded) return;
      expanded = false;
      revision = 0;
      resetSelection();
      ctx.arrange('gather');
    });

    ctx.add('reconcileVisibility', () => {
      if (disposed) return;
      const section = root.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      root.current.dataset.inView = section.bottom > 0 && section.top < viewportHeight;
      // Only the complete SECTION crossing the viewport edge may gather.
      // The stage leaving view while the heading/footer remains is not an exit.
      if (section.bottom <= 0 || section.top >= viewportHeight) {
        ctx.gather();
        return;
      }
      const wall = stage.current.getBoundingClientRect();
      const sky = sceneGeometry(root.current, stage.current, root.current.querySelector('.memory-wall__rule')).sky;
      const top = section.top + sky.top, bottom = section.top + sky.bottom;
      if (!expanded && wall.top < viewportHeight && top < viewportHeight && bottom > 0) ctx.scatter();
    });

    ctx.add('showFace', (show) => {
      if (active < 0) return;
      reversed = show;
      setBack(show);
      prepareAdvance();
      const front = nodes[active].querySelector('[data-memory-face="front"]');
      const reverse = nodes[active].querySelector('[data-memory-face="back"]');
      gsap.to(front, { autoAlpha: show ? 0 : 1, scale: show ? .97 : 1, duration: reduced.matches ? 0 : .28, overwrite: 'auto' });
      gsap.to(reverse, { autoAlpha: show ? 1 : 0, scale: show ? 1 : .97, duration: reduced.matches ? 0 : .32, overwrite: 'auto' });
      const related = memoryAssociations[memories[active].id] || [];
      propNodes.forEach((node, i) => {
        if (related.includes(memoryProps[i].id)) gsap.to(node.querySelector('svg'), {
          rotation: show ? (i % 2 ? -4 : 4) : 0, scale: show ? .96 : 1,
          duration: reduced.matches ? 0 : .32, overwrite: 'auto',
        });
      });
    });

    ctx.add('focusMemory', (index, toggle = false) => {
      const bounds = root.current.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      expanded = true;
      if (index === active) {
        if (toggle && memories[index].image && memories[index].description.trim()) ctx.showFace(!reversed);
        return;
      }
      stopAdvance();
      // Stop reverse-face tweens independently of the outer position timeline.
      gsap.killTweensOf(faces);
      gsap.set(root.current.querySelectorAll('[data-memory-face="front"]'), { autoAlpha: 1, scale: 1 });
      gsap.set(root.current.querySelectorAll('[data-memory-face="back"]'), { autoAlpha: 0, scale: .97 });
      active = index; reversed = false; revision += 1;
      setSelected(index); setBack(false);
      ctx.arrange('focus');
    });

    controls.current = {
      select: index => ctx.focusMemory(index, true),
      step: direction => ctx.focusMemory(active < 0 ? (direction > 0 ? 0 : nodes.length - 1) : (active + direction + nodes.length) % nodes.length),
      close: () => ctx.showFace(false),
    };
    ctx.arrange('stack', false);
    lifecycle = ScrollTrigger.create({
      id: 'memory-wall-lifecycle', trigger: root.current,
      start: 'top bottom', end: 'bottom top',
      onEnter: () => ctx.reconcileVisibility(),
      onEnterBack: () => ctx.reconcileVisibility(),
      onLeave: () => ctx.reconcileVisibility(),
      onLeaveBack: () => ctx.reconcileVisibility(),
      onUpdate: () => ctx.reconcileVisibility(),
      onRefresh: () => ctx.reconcileVisibility(),
    });
    // Complements ScrollTrigger when image loads or upstream pin refreshes
    // change geometry, without adding another scroll listener or scroll driver.
    const visibility = new IntersectionObserver(() => ctx.reconcileVisibility(), { threshold: 0 });
    visibility.observe(root.current);
    ctx.reconcileVisibility();
    const sizeKey = () => `${stage.current.clientWidth}:${stage.current.clientHeight}:${root.current.clientHeight}`;
    let previousSize = sizeKey();
    const observer = new ResizeObserver(() => {
      const nextSize = sizeKey();
      if (nextSize === previousSize) return;
      previousSize = nextSize;
      if (disposed) return;
      // ResizeObserver runs before paint. Reproject here, not in the next RAF,
      // so a shrunken viewport cannot paint a frame with old unsafe positions.
      const transitioning = ['scattering', 'gathering', 'focusing'].includes(phase);
      ctx.arrange(expanded ? active >= 0 ? 'focus' : 'scatter' : transitioning ? 'gather' : 'stack', transitioning);
      lifecycle.refresh();
      ctx.reconcileVisibility();
    });
    observer.observe(stage.current);
    observer.observe(root.current);
    const motionChange = () => ctx.arrange(expanded ? active >= 0 ? 'focus' : 'scatter' : 'stack', false);
    const visibilityChange = () => prepareAdvance();
    document.addEventListener('visibilitychange', visibilityChange);
    reduced.addEventListener('change', motionChange);
    return () => {
      disposed = true;
      stopAdvance();
      observer.disconnect(); visibility.disconnect(); lifecycle.kill();
      document.removeEventListener('visibilitychange', visibilityChange);
      reduced.removeEventListener('change', motionChange);
      timeline?.kill(); ctx.revert(); controls.current = null;
    };
  }, []);

  return <section id="closing" className="memory-wall section-space" ref={root} aria-labelledby="memory-wall-title">
    <svg className="memory-wall__sky" viewBox="0 0 1536 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <image href={desertScene.source} width="1536" height="1024"/>
    </svg>
    <svg className="memory-wall__desert" viewBox="0 300 1536 724" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <image href={desertScene.source} width="1536" height="1024"/>
      <rect className="memory-wall__person" x="718" y="505" width="101" height="334" fill="none"/>
    </svg>
    <SectionLabel sectionId="closing">ABOUT ME</SectionLabel>
    <div className="memory-wall__heading">
      <div><p className="memory-wall__eyebrow">PERSONAL ARCHIVE / LITTLE MOMENTS</p>
        <h2 id="memory-wall-title" className="display">A LITTLE MORE<br/>ABOUT <span>ME.</span></h2></div>
      <p className="memory-wall__intro">일상에서 마주한 사람들과 새로운 경험들.<br/>그 순간들이 모여 지금의 저를 만들어갑니다.</p>
    </div>
    <div className="memory-wall__rule"><span>A FEW PIECES OF MY WORLD</span><span>사진을 골라 펼쳐보세요 ↗</span></div>
    <div className="memory-wall__stage" ref={stage} role="group" aria-label="개인 사진 메모리 월" onKeyDown={event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); controls.current?.step(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.key === 'Escape') controls.current?.close();
    }}>
      <div className="memory-wall__props" aria-hidden="true">
      {memoryProps.map(prop => <span key={prop.id} className="memory-prop" aria-hidden="true"
        data-memory-prop={prop.id} data-related={(memoryAssociations[memories[selected]?.id] || []).includes(prop.id)}
        ref={node => { if (node) props.current.set(prop.id, node); else props.current.delete(prop.id); }}
        style={{ '--prop-width': `${prop.width}px`, '--prop-height': `${prop.width * prop.view[3] / prop.view[2]}px` }}>
        <svg viewBox={prop.view.join(' ')} focusable="false"><image href={prop.source} width={prop.size[0]} height={prop.size[1]}/></svg>
      </span>)}
      </div>
      <div className="memory-wall__photos">
      {memories.map((memory, index) => {
        const isSelected = selected === index;
        const isBack = isSelected && back;
        const canFlip = Boolean(memory.image && memory.description.trim());
        const { frame, cardStyle, imageStyle } = memoryPresentation(memory);
        return <button type="button" key={memory.id} ref={node => { if (node) cards.current.set(memory.id, node); else cards.current.delete(memory.id); }}
          className="memory-card" style={cardStyle} data-frame={memory.frame || 'portrait-clean'} data-memory-id={memory.id} data-selected={isSelected} data-back={isBack}
          aria-pressed={isSelected} aria-label={`${index + 1}. ${memory.title}${isSelected && canFlip ? (isBack ? ' — 사진 보기' : ' — 설명 보기') : ' — 선택'}`}
          onClick={() => controls.current?.select(index)}>
          <span className="memory-card__float" style={{ '--float-time': `${6.5 + index % 5 * .7}s`, '--float-delay': `${-index * 1.37}s` }}>
          <span className="memory-card__front" data-memory-face="front" aria-hidden={isBack}>
            <span className={`memory-card__image ${memory.image ? '' : 'memory-card__image--empty'}`}>
              {memory.image ? <img style={imageStyle} src={memory.image} alt={memory.alt || memory.title} loading="lazy" decoding="async"/> :
                <span className="memory-card__placeholder"><span className="memory-card__placeholder-mark" aria-hidden="true">+</span><span>A MEMORY TO COME</span><small>사진을 기다리는 자리</small></span>}
            </span>
            <svg className="memory-card__frame" viewBox={frame.paper.join(' ')} aria-hidden="true" focusable="false">
              <image href={frame.source} width={frame.size[0]} height={frame.size[1]}/>
            </svg>
            <span className="memory-card__caption"><span>{memory.title}</span><small>{String(index + 1).padStart(2, '0')} / {memory.category}</small></span>
          </span>
          <span className="memory-card__back" data-memory-face="back" aria-hidden={!isBack}>
            <small>{memory.year || memory.category}</small><span className="memory-card__back-title">{memory.title}</span>
            <span className="memory-card__description">{canFlip ? memory.description : ''}</span>
            <span className="memory-card__return">↩ 사진으로 돌아가기</span>
          </span>
          </span>
        </button>;
      })}
      </div>
    </div>
    <div className="memory-wall__bottom">
      <nav className="memory-wall__nav" aria-label="추억 사진 탐색">
        <button type="button" onClick={() => controls.current?.step(-1)} aria-label="이전 사진">← <span>PREVIOUS</span></button>
        <span className="memory-wall__count" aria-live="polite" aria-atomic="true">{String(selected + 1).padStart(2, '0')} <span>/ {String(memories.length).padStart(2, '0')}</span></span>
        <button type="button" onClick={() => controls.current?.step(1)} aria-label="다음 사진"><span>NEXT</span> →</button>
      </nav>
    </div>
    <div className="memory-wall__progress" aria-hidden="true"><span style={{ transform: `scaleX(${(selected + 1) / memories.length})` }}/></div>
  </section>;
}
