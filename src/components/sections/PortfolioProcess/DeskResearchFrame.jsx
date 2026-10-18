// Every asset is a Figma node export. MCP adds 40 source units of export padding.
const exportStyle=frame=>{
  const padding=frame.imagePadding||{x:frame.exportPadding??40,y:frame.exportPadding??40};
  return {width:frame.width+padding.x*2,height:frame.height+padding.y*2,left:-padding.x,top:-padding.y};
};

export default function DeskResearchFrame({frame,variant='primary',selected,hovered,highResolution,onHover,onSelect,onExpand}) {
  const background=variant==='background';
  const imageStyle=exportStyle(frame);
  const x=background?frame.x:frame.position.x,y=background?frame.y:frame.position.y;
  const image=<img src={background?undefined:(frame.preview||frame.image)} data-src={background?frame.image:undefined} width={imageStyle.width} height={imageStyle.height} style={imageStyle} alt={background?'':`${frame.title} 실제 Figma 원본 섹션 전체`} decoding="async" draggable="false"/>;
  return <div data-desk-frame={background?undefined:frame.id} data-background-frame={background?frame.id:undefined} data-figma-node={background?frame.id:frame.figmaNodeId}
    className={`desk-frame research-frame--${variant}${selected?' is-selected':''}${hovered?' is-hovered':''}`}
    style={{left:x,top:y,width:frame.width,height:frame.height,...(frame.id==='410:1575'?{zIndex:3}:{})}} aria-hidden={background?true:undefined}>
    <div className="desk-frame__surface">
      {!background&&<span className="desk-frame__name"><span>{`${frame.number} / ${frame.englishTitle.toUpperCase()}`}</span></span>}
      {background?<div className="desk-frame__background-image">{image}</div>:<button type="button" tabIndex={selected===false?-1:0} className="desk-frame__select" aria-label={`${frame.title} ${selected&&!frame.inlineOnly?'원본 전체 읽기':'확대 선택'}`} aria-pressed={Boolean(selected)}
        onPointerEnter={event=>{if(event.pointerType==='mouse')onHover(frame.id,true);}} onPointerLeave={()=>onHover(frame.id,false)} onFocus={()=>onHover(frame.id,true)} onBlur={()=>onHover(frame.id,false)}
        onClick={event=>selected&&!frame.inlineOnly&&frame.document?onExpand(frame.document,event.currentTarget):onSelect(frame.id,event.currentTarget)}>
        {frame.image?image:<span className="desk-frame__placeholder" aria-hidden="true"/>}
        {highResolution&&frame.image&&<img className="desk-frame__high-resolution" src={frame.image} width={imageStyle.width} height={imageStyle.height} style={imageStyle} alt="" decoding="async" draggable="false"/>}
      </button>}
    </div>
  </div>;
}
