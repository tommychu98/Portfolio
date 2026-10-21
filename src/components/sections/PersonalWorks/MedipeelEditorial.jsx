import { useEffect, useRef, useState } from 'react';
import { medipeel } from '../../../data/medipeel';
import Link from '../../ui/Link';
import Button from '../../ui/Button';
import './MedipeelEditorial.css';

function EditorialImage({ image }) {
  const [failed, setFailed] = useState(false);
  return <figure className={`medipeel-editorial__image medipeel-editorial__image--${image.kind}`} data-editorial-reveal>
    {failed || !image.src
      ? <div className="medipeel-editorial__slot" role="img" aria-label={image.alt}><span>{image.kind === 'planning' ? '기획 화면' : '구현 화면'}</span></div>
      : <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" onError={() => setFailed(true)}/>}
    <figcaption>{image.caption}</figcaption>
  </figure>;
}

export default function MedipeelEditorial({ href, onClose }) {
  const root = useRef(null);
  useEffect(() => {
    const element = root.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer;
    function setup() {
      observer?.disconnect();
      element.querySelectorAll('[data-editorial-reveal]').forEach(node => node.classList.remove('is-pending'));
      if (preference.matches) return;
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-pending');
        observer.unobserve(entry.target);
      }), { root: element.closest('dialog'), threshold: 0.05 });
      element.querySelectorAll('[data-editorial-reveal]').forEach(node => {
        node.classList.add('is-pending');
        observer.observe(node);
      });
    }
    setup();
    preference.addEventListener('change', setup);
    return () => { observer?.disconnect(); preference.removeEventListener('change', setup); };
  }, []);

  return <article ref={root} className="medipeel-editorial" aria-labelledby="personal-detail-title">
    <div className="medipeel-editorial__layout">
      <header className="medipeel-editorial__heading" data-editorial-reveal>
        <span className="medipeel-editorial__label">{medipeel.label}</span>
        <h3 id="personal-detail-title">{medipeel.title}</h3>
        <p className="medipeel-editorial__introduction">{medipeel.introduction}</p>
        <p className="medipeel-editorial__tools"><span>TOOLS</span>{medipeel.tools}</p>
      </header>
      <div className="medipeel-editorial__body">{medipeel.paragraphs.map((paragraph, index) => <p key={index} data-editorial-reveal>{paragraph.map((part, partIndex) => part.emphasis ? <strong key={partIndex}>{part.text}</strong> : part.text)}</p>)}</div>
    </div>
    <div className="medipeel-editorial__images">{medipeel.images.map(image => <EditorialImage key={image.kind} image={image}/>)}</div>
    <div className="medipeel-editorial__links link-row" data-editorial-reveal><Link href={href}>VIEW PROJECT</Link><Button onClick={onClose}>BACK TO WORKS ↙</Button></div>
  </article>;
}
