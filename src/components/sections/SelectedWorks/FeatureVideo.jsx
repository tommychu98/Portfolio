import { useEffect, useRef, useState } from 'react';
import './FeatureVideo.css';

export default function FeatureVideo({ feature, enabled = true, visibleOnly = false }) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const video = videoRef.current;
    let disposed = false, visible = !visibleOnly;
    const play = () => {
      if (disposed || document.hidden || !visible) { video.pause(); return; }
      if (!video.hasAttribute('src')) video.src = feature.src;
      video.play().catch(() => {
        // Retry on the next browser readiness or visibility event.
      });
    };
    video.muted = true;
    const observer = visibleOnly ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      play();
    }, { root: video.closest('dialog'), threshold: 0 }) : null;
    observer?.observe(video);
    video.addEventListener('canplay', play);
    document.addEventListener('visibilitychange', play);
    play();
    return () => {
      disposed = true;
      observer?.disconnect();
      video.removeEventListener('canplay', play);
      document.removeEventListener('visibilitychange', play);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [feature.src, enabled, visibleOnly]);

  return <article className="feature-video" aria-labelledby={`${feature.id}-title`}>
    <div className="feature-video__media">
      <video ref={videoRef} id={`${feature.id}-video`} width={feature.width} height={feature.height}
        poster={feature.poster} preload={visibleOnly ? 'none' : 'auto'} autoPlay={enabled && !visibleOnly} muted loop playsInline
        controls={false} disablePictureInPicture disableRemotePlayback
        aria-label={feature.title} onError={() => setFailed(true)}/>
      {failed && <p className="feature-video__error" role="status">영상을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.</p>}
    </div>
    <div className="feature-video__copy"><h4 id={`${feature.id}-title`}>{feature.title}</h4><p>{feature.description}</p></div>
  </article>;
}
