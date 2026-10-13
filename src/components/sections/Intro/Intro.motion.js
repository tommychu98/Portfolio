import { gsap } from '../../../motion/scroll';
import { introObjects } from './Intro.objects';
import { advanceObject, clamp, constrainPoint } from './Intro.physics';

export function initIntro(root) {
  const stage=root.querySelector('[data-intro-stage]');
  const listeners=[];
  const states=[...root.querySelectorAll('[data-intro-object]')].map((element,index)=>({
    element, art:element.querySelector('[data-object-art]'), data:introObjects[index], originalStyle:element.getAttribute('style'),
    x:0,y:0,vx:0,vy:0,angle:(Math.random()-.5)*38,scale:1,hover:false,drag:null,
  }));
  let frame=0,previous=0,visible=true,disposed=false,entrance;
  const listen=(target,type,handler,options)=>{target.addEventListener(type,handler,options);listeners.push(()=>target.removeEventListener(type,handler,options));};
  const render=state=>{
    state.element.style.left='0px';state.element.style.top='0px';
    state.element.style.transform=`translate3d(${state.x-state.size/2}px,${state.y-state.size/2}px,0)`;
    state.art.style.transform=`rotate(${state.rotation}deg) scale(${state.scale})`;
  };
  const stop=()=>{cancelAnimationFrame(frame);frame=0;previous=0;};
  function tick(time) {
    frame=0;
    if(disposed||!visible||document.hidden)return;
    const dt=Math.min((time-(previous||time-16.67))/1000,.032);previous=time;
    let busy=false;
    states.forEach(state=>{
      if(!state.drag)advanceObject(state,dt);
      const targetScale=state.hover||state.drag?1.08:1;
      const targetRotation=state.angle+clamp(state.vx*.007,-9,9);
      const follow=1-Math.exp(-12*dt);
      state.scale+=(targetScale-state.scale)*follow;
      state.rotation+=(targetRotation-state.rotation)*follow;
      render(state);
      if(state.vx||state.vy||Math.abs(targetScale-state.scale)>.001||Math.abs(targetRotation-state.rotation)>.02)busy=true;
    });
    if(busy)frame=requestAnimationFrame(tick);else previous=0;
  }
  function wake(){if(!frame&&visible&&!document.hidden&&!disposed)frame=requestAnimationFrame(tick);}
  function release(state,cancelled=false){
    const drag=state.drag;if(!drag)return;
    state.drag=null;state.hover=false;state.element.classList.remove('is-dragging');
    if(cancelled||performance.now()-drag.lastTime>100){state.vx=0;state.vy=0;}
    if(state.element.hasPointerCapture?.(drag.id))state.element.releasePointerCapture(drag.id);
    wake();
  }
  let dimensions;
  function measure(){
    const box=stage.getBoundingClientRect();
    if(dimensions?.width===box.width&&dimensions?.height===box.height)return;
    const placed=[];
    states.forEach(state=>{
      release(state,true);
      state.size=state.element.offsetWidth||parseFloat(getComputedStyle(state.element).width)||100;
      const half=state.size*.71;
      state.bounds={left:half+8,right:Math.max(half+8,box.width-half-8),top:90+half,bottom:Math.max(90+half,box.height-80-half)};
      if(!state.home){
        // Best-candidate scatter: no rows, columns or runtime text collision.
        let best,score=-Infinity;
        for(let i=0;i<100;i++){
          const p={x:state.bounds.left+Math.random()*(state.bounds.right-state.bounds.left),y:state.bounds.top+Math.random()*(state.bounds.bottom-state.bounds.top)};
          const center=Math.abs(p.x-box.width/2)<Math.min(260,box.width*.38)&&Math.abs(p.y-box.height*.48)<170;
          const distance=Math.min(box.width*.32,...placed.map(other=>Math.hypot(p.x-other.x,p.y-other.y)-(state.size+other.size)*.45));
          const candidate=distance-(center?350:0);
          if(candidate>score){score=candidate;best=p;}
        }
        state.home=best;state.x=best.x;state.y=best.y;
      }else if(dimensions){
        const ratioX=box.width/dimensions.width,ratioY=box.height/dimensions.height;
        state.home=constrainPoint({x:state.home.x*ratioX,y:state.home.y*ratioY},state.bounds);
        Object.assign(state,constrainPoint({x:state.x*ratioX,y:state.y*ratioY},state.bounds));
      }
      if(getComputedStyle(state.element).display!=='none')placed.push(state);
      state.vx=0;state.vy=0;state.scale=1;state.rotation=state.angle;render(state);
    });
    dimensions={width:box.width,height:box.height};
  }
  measure();
  const context=gsap.context(()=>{
    entrance=gsap.timeline();
    entrance.fromTo(root.querySelectorAll('[data-object-entrance]'),{scale:0,rotation:i=>i%2?-65:65,opacity:0},{scale:1,rotation:0,opacity:1,duration:1.2,stagger:.085,ease:'back.out(3)'},.05)
      .fromTo(root.querySelector('[data-intro-name]'),{y:60,opacity:0},{y:0,opacity:1,duration:.6,ease:'back.out(1.4)'},.25)
      .fromTo(root.querySelectorAll('[data-intro-reveal]'),{y:18,opacity:0},{y:0,opacity:1,duration:.65,stagger:.12,ease:'power3.out'},.5);
  },root);
  for(const state of states){
    listen(state.element,'pointerdown',event=>{
      if((event.pointerType==='mouse'&&event.button!==0)||state.drag)return;
      event.preventDefault();
      state.vx=0;state.vy=0;
      const rect=stage.getBoundingClientRect();
      state.drag={id:event.pointerId,offsetX:event.clientX-rect.left-state.x,offsetY:event.clientY-rect.top-state.y,lastTime:performance.now()};
      state.element.setPointerCapture(event.pointerId);state.element.classList.add('is-dragging');wake();
    });
    listen(state.element,'pointermove',event=>{
      if(!state.drag||state.drag.id!==event.pointerId)return;
      const now=performance.now(),dt=Math.max((now-state.drag.lastTime)/1000,.008);
      const rect=stage.getBoundingClientRect();
      const next=constrainPoint({x:event.clientX-rect.left-state.drag.offsetX,y:event.clientY-rect.top-state.drag.offsetY},state.bounds);
      state.vx=clamp((next.x-state.x)/dt,-1500,1500);
      state.vy=clamp((next.y-state.y)/dt,-1500,1500);
      state.x=next.x;state.y=next.y;state.drag.lastTime=now;render(state);wake();
    });
    listen(state.element,'pointerup',event=>{if(state.drag?.id===event.pointerId)release(state);});
    listen(state.element,'pointercancel',()=>release(state,true));
    listen(state.element,'lostpointercapture',()=>release(state,true));
    listen(state.element,'pointerenter',event=>{if(event.pointerType==='mouse'){state.hover=true;wake();}});
    listen(state.element,'pointerleave',()=>{state.hover=false;wake();});
    listen(state.element,'keydown',event=>{
      const shifts={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]};
      if(event.key==='Home'||shifts[event.key]){
        event.preventDefault();release(state,true);
        const delta=shifts[event.key];const next=delta?constrainPoint({x:state.x+delta[0],y:state.y+delta[1]},state.bounds):state.home;
        state.x=next.x;state.y=next.y;state.vx=0;state.vy=0;render(state);
      }
    });
    listen(state.element,'click',event=>{
      if(event.detail!==0)return;
      state.vx=120;state.vy=-90;wake();
    });
  }
  listen(stage,'dragstart',event=>event.preventDefault());
  listen(root.querySelector('[data-intro-reset]'),'click',()=>{stop();states.forEach(state=>{release(state,true);Object.assign(state,state.home,{vx:0,vy:0,scale:1,rotation:state.angle});render(state);});});
  listen(document,'visibilitychange',()=>{
    if(document.hidden){stop();states.forEach(state=>release(state,true));entrance?.pause();}
    else if(visible){entrance?.resume();wake();}
  });
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;
    if(visible){entrance?.resume();wake();}else{stop();states.forEach(state=>release(state,true));entrance?.pause();}
  },{threshold:0});observer.observe(stage);
  const resize=new ResizeObserver(measure);resize.observe(stage);
  return()=>{
    disposed=true;stop();states.forEach(state=>release(state,true));
    resize.disconnect();observer.disconnect();listeners.forEach(remove=>remove());context.revert();
    states.forEach(state=>{state.element.setAttribute('style',state.originalStyle);state.art.style.removeProperty('transform');});
  };
}
