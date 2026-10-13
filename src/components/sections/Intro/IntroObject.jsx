export default function IntroObject({ object }) {
  return <button type="button" className="intro-object" data-intro-object={object.id}
    aria-label={`${object.label} 움직이기`} aria-describedby="intro-object-help"
    draggable={false} data-lenis-prevent
    style={{ '--object-size':`${object.size}px` }}>
    <span className="intro-object__entrance" data-object-entrance>
      <span className="intro-object__art" data-object-art>
        <img src={object.src} alt="" draggable={false} decoding="async" />
      </span>
    </span>
  </button>;
}
