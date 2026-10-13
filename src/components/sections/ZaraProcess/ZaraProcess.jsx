import { useEffect, useRef, useState } from 'react';
import content, { links } from '../../../data/projects';
import SectionLabel from '../../ui/SectionLabel';
import Button from '../../ui/Button';
import Link from '../../ui/Link';
import HorizontalControls from '../../ui/HorizontalControls';
import { pauseScroll } from '../../../motion/scroll';
import { initZaraProcess } from './ZaraProcess.motion';
import './ZaraProcess.css';
function ProcessStep({step,index,onExpand}){
  const [selected,setSelected]=useState(0);
  const material=step.materials[selected];
  return <article className="horizontal-panel zara-process__step" data-panel><div className="zara-process__material"><button type="button" className="zara-process__preview" onClick={()=>onExpand(material)} aria-label={`${material.label} 확대`}><img src={material.src} alt={`${step.title} — ${material.label}`} loading="lazy"/><span>자료 확대 ↗</span></button><div className="zara-process__material-footer"><span>{material.label}</span><Link href={material.src} target="_blank" rel="noopener noreferrer">원본 열기</Link></div></div><div className="zara-process__copy"><span className="fine-print">PROCESS 0{index+1} / 06</span><h3>{step.title}</h3><p>{step.body}</p><div className="zara-process__tabs" role="group" aria-label={`${step.title} 자료 선택`}>{step.materials.map((m,i)=><Button key={m.id} aria-pressed={selected===i} onClick={()=>setSelected(i)}>{m.label}</Button>)}</div><span className="zara-process__note">자료를 선택하고 확대해 기획 과정을 살펴보세요.</span></div></article>;
}
export default function ZaraProcess(){
  const ref=useRef(null);const dialog=useRef(null);const opener=useRef(null);const [material,setMaterial]=useState(null);
  useEffect(()=>initZaraProcess(ref.current),[]);
  useEffect(()=>{
    if(!material)return;
    const el=dialog.current;el.showModal();pauseScroll(true);
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
    return()=>{el.close();pauseScroll(false);document.body.style.overflow=overflow;opener.current?.focus({preventScroll:true});};
  },[material]);
  const expand=m=>{opener.current=document.activeElement;setMaterial(m);};
  return <section id="zara-process" ref={ref} className="zara-process" aria-labelledby="process-title"><div className="horizontal-viewport" data-viewport><div className="horizontal-heading"><SectionLabel number="08">ZARA / UX PLANNING PROCESS</SectionLabel><h2 id="process-title">From questions <em>to clarity.</em></h2></div><div data-track><article className="horizontal-panel zara-process__cover" data-panel><div className="zara-process__collage">{[['persona','Persona'],['lean','Lean Canvas'],['requirements','Requirements']].map(([id,label])=><button key={id} type="button" onClick={()=>expand({label,src:`/media/images/zara-methodology/${id}.png`})} aria-label={`${label} 확대`}><span>{label}</span><img src={`/media/images/zara-methodology/${id}.png`} alt={label} loading="lazy"/></button>)}</div><div className="zara-process__intro"><span className="fine-print">TEAM PROJECT / PROCESS</span><h3>Think.<br/>Arrange.<br/><em>Design.</em></h3><p>{content.processIntro}</p><Link href={links.proposal}>FULL PROPOSAL</Link></div></article>{content.process.map((step,i)=><ProcessStep key={step.title} step={step} index={i} onExpand={expand}/>)}</div><HorizontalControls label="UX 과정"/></div>
    <dialog ref={dialog} className="zara-process__dialog" aria-label={material?`${material.label} 확대`:'기획 자료 확대'} onCancel={()=>setMaterial(null)} onClick={e=>{if(e.target===dialog.current)setMaterial(null);}} data-lenis-prevent><div className="zara-process__dialog-bar"><span>{material?.label}</span><a href={material?.src} target="_blank" rel="noopener noreferrer">원본 새 창 ↗</a><Button autoFocus onClick={()=>setMaterial(null)} aria-label="기획 자료 닫기">닫기 ×</Button></div>{material&&<div className="zara-process__dialog-scroll"><img src={material.src} alt={material.label}/></div>}</dialog>
  </section>;
}
