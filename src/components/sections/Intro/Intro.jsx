import { useEffect, useRef } from 'react';
import Link from '../../ui/Link';
import IntroObject from './IntroObject';
import { introObjects } from './Intro.objects';
import { initIntro } from './Intro.motion';
import './Intro.css';

export default function Intro({ ready = true }) {
  const root = useRef(null);
  useEffect(() => ready ? initIntro(root.current) : undefined, [ready]);
  return <section id="intro" className="intro" ref={root} aria-labelledby="intro-name">
    <div className="intro__stage" data-intro-stage style={{ visibility: ready ? 'visible' : 'hidden' }}>
      <div className="intro__objects" role="group" aria-label="움직여 보는 웹디자인 오브젝트">
        {introObjects.map(object => <IntroObject key={object.id} object={object}/>)}
      </div>
      <div className="intro__identity">
        <p className="intro__discipline" data-intro-reveal>WEB DESIGN &amp; PUBLISHING</p>
        <h1 id="intro-name" data-intro-name>주경덕</h1>
        <p className="intro__edition" data-intro-reveal>PORTFOLIO <span>2026</span></p>
        <p className="intro__invitation" data-intro-reveal>(아이콘을 움직이며 탐색해 보세요)</p>
      </div>
      <p className="sr-only" id="intro-object-help">마우스나 손가락으로 아이콘을 끌어 보세요. 키보드 방향키로 이동하고 Home 키로 원위치에 놓을 수 있습니다. Enter 또는 Space 키로 가볍게 움직입니다.</p>
      <div className="intro__footer" data-intro-footer>
        <Link href="#work">SELECTED WORKS</Link>
        <button type="button" className="intro__reset" data-intro-reset>오브젝트 정리 <span aria-hidden="true">↺</span></button>
        <a href="#story" className="intro__scroll">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></a>
      </div>
    </div>
  </section>;
}
