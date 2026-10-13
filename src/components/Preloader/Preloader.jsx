import { useEffect, useRef, useState } from 'react';
import { initPreloader } from './Preloader.motion';
import './Preloader.css';

export default function Preloader({ children, sources }) {
  const root=useRef(null);
  const [ready,setReady]=useState(false);
  const [finished,setFinished]=useState(false);
  useEffect(()=>initPreloader(root.current,sources,()=>setReady(true),()=>setFinished(true)),[sources]);
  return <>
    {!finished && <div className="preloader" ref={root} role="status" aria-label="포트폴리오 준비 중" data-lenis-prevent>
      <svg className="preloader__drawing" viewBox="0 0 320 240" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path data-draw d="M46 177 Q39 176 40 166 L42 53 Q42 43 55 44 L253 47 Q265 47 263 60 L260 174 Q260 183 248 182 L46 177"/>
          <path data-draw d="M43 76 Q148 72 262 79 M59 60 L61 60 M73 60 L75 60 M87 61 L89 61"/>
          <path data-draw d="M60 96 L144 95 L143 153 L60 153 Z M63 143 L87 119 L105 135 L119 125 L140 147 M162 99 L238 100 M162 116 L226 118 M162 135 L236 137 M162 154 L209 155"/>
          <path data-draw d="M214 144 L223 208 L240 192 L253 214 L268 206 L253 185 L278 182 Z" fill="#f3e6c7"/>
          <path data-draw d="M29 203 Q103 191 175 204 M34 211 Q96 202 148 212"/>
        </g>
      </svg>
      <p className="preloader__caption">DRAWING THE NEXT CHAPTER</p>
      <span className="sr-only">이미지와 글꼴을 준비하고 있습니다.</span>
    </div>}
    {children(ready)}
  </>;
}
