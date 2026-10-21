import { useEffect, useRef, useState } from 'react';
import CardStage from './CardStage';
import ProjectDetail from './ProjectDetail';
import { selectedProjects } from './SelectedWorks.data';
import { initSelectedWorks } from './SelectedWorks.motion';
import './SelectedWorks.css';

export default function SelectedWorks() {
  const root=useRef(null), controller=useRef(null), saved=useRef(null);
  const [active,setActive]=useState(0),[selected,setSelected]=useState(null);
  useEffect(()=>{controller.current=initSelectedWorks(root.current,selectedProjects,setActive);return()=>controller.current?.destroy();},[]);
  const open=(index,event)=>{
    if(selected!==null)return;
    const scene=root.current.querySelectorAll('[data-project]')[index];
    saved.current={button:event.currentTarget,index,y:scrollY,width:innerWidth,height:innerHeight,transforms:[...scene.querySelectorAll('[data-card]')].map(el=>getComputedStyle(el).transform)};
    controller.current.lock(true);setSelected({index,origin:saved.current});
  };
  const close=()=>{
    setSelected(null);
    requestAnimationFrame(()=>{
      const origin=saved.current;
      controller.current?.restore(origin.index,origin.y,origin.width===innerWidth&&origin.height===innerHeight);
      origin.button?.focus({preventScroll:true});
    });
  };
  return <section id="personal" ref={root} className="selected-works" aria-label="Personal Works — Selected Projects">
    <CardStage projects={selectedProjects} active={selected===null?active:-1} onOpen={open} onSelect={index=>controller.current.select(index)}/>
    {selected!==null&&<ProjectDetail project={selectedProjects[selected.index]} origin={selected.origin} onClosed={close}/>}
  </section>;
}
