import assert from 'node:assert/strict';
import { act, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Intro from './Intro';
import { gsap, ScrollTrigger } from '../../../motion/scroll';

export async function run(){
  const root=createRoot(document.getElementById('test-root'));
  const outside=ScrollTrigger.create({trigger:document.body,start:0,end:100});
  const event=(el,type,props={})=>act(()=>{const e=new Event(type,{bubbles:true,cancelable:true});for(const [key,value] of Object.entries(props))Object.defineProperty(e,key,{value});el.dispatchEvent(e);});
  try{
    await act(()=>root.render(<StrictMode><Intro/></StrictMode>));
    assert.equal(document.querySelector('h1').textContent,'주경덕');
    const objects=[...document.querySelectorAll('[data-intro-object]')];assert.equal(objects.length,18);
    for(const el of objects){
      const home=el.style.transform;
      await event(el,'keydown',{key:'ArrowRight'});
      await event(el,'keydown',{key:'Home'});assert.equal(el.style.transform,home);
      for(const pointerType of ['mouse','touch']){
        await event(el,'pointerdown',{pointerType,pointerId:1,button:0,clientX:0,clientY:0});
        assert(el.classList.contains('is-dragging'));assert.equal(el.capture,1);
        await event(el,'pointermove',{pointerId:1,clientX:-70,clientY:-40});
        assert.notEqual(el.style.transform,home);
        await event(el,'pointerup',{pointerId:1});assert(!el.classList.contains('is-dragging'));
        await event(el,'keydown',{key:'Home'});assert.equal(el.style.transform,home);
      }
    }
    await event(objects[0],'pointerdown',{pointerType:'touch',pointerId:2,button:0,clientX:10,clientY:10});
    await event(objects[0],'pointercancel',{pointerId:2});assert(!objects[0].classList.contains('is-dragging'));
    // Move through the center in small increments while capture remains active.
    const target=objects[0];
    const position=()=>target.style.transform.match(/translate3d\(([-\d.]+)px,([-\d.]+)px/).slice(1).map(Number);
    const [left,top]=position(),half=target.offsetWidth/2;
    await event(target,'pointerdown',{pointerType:'mouse',pointerId:9,button:0,clientX:left+half,clientY:top+half});
    const center=document.body.getBoundingClientRect().width/2;
    for(const dx of [-40,-20,0,20,40]){
      await event(target,'pointermove',{pointerId:9,clientX:center+dx,clientY:440});
      assert(Math.abs(position()[0]+half-center-dx)<.001,'Continuous central crossing');
      assert(Math.abs(position()[1]+half-440)<.001,'No text projection');
      assert.equal(target.capture,9);
    }
    await event(target,'pointerup',{pointerId:9});
    await event(document.querySelector('[data-intro-reset]'),'click');
    assert.equal(ScrollTrigger.getAll().length,1,'INTRO must not create global scroll triggers');
    await act(()=>root.unmount());
    assert(ScrollTrigger.getAll().includes(outside));
    assert.equal(objects[0].capture,null);
    return {objects:18,checks:'StrictMode cleanup, keyboard Home, mouse/touch capture and drag, cancel, stable reset, no new scroll trigger',limitation:'Simulated DOM and pure physics only. Real browser rendering, touch scrolling and visual comparison unavailable.'};
  }finally{outside.kill();ScrollTrigger.disable();gsap.ticker.sleep();}
}
