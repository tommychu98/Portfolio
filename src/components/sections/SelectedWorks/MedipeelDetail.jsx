import FeatureVideo from './FeatureVideo';
import './MedipeelDetail.css';

export default function MedipeelDetail({ project, onClose, isClosing }) {
  const detail = project.detail;
  return <article className="medipeel-detail">
    <header className="medipeel-detail__header">
      <h2 id="selected-detail-title">{project.titleLines.map(line => <span key={line}>{line}</span>)}</h2>
      <p className="medipeel-detail__subtitle">{detail.subtitle}</p>
      <div className="medipeel-detail__meta">{detail.period && <p>{detail.period}</p>}<p>{detail.type}</p></div>
    </header>
    <p className="medipeel-detail__description">{detail.description}</p>
    <div className="medipeel-detail__overview">
      <section aria-labelledby={`${project.id}-role`}><h3 id={`${project.id}-role`}>Role &amp; Responsibility</h3><ul>{detail.roles.map(role => <li key={role}>{role}</li>)}</ul></section>
      <div>
        <section aria-labelledby={`${project.id}-tech`}><h3 id={`${project.id}-tech`}>Tech Stack</h3><div className="medipeel-detail__badges">{detail.technologies.map(tech => <span key={tech.name} style={{ backgroundColor: tech.color, color: tech.ink || '#fff' }}>{tech.name}</span>)}</div></section>
        <section className="medipeel-detail__creative" aria-labelledby={`${project.id}-creative`}><h3 id={`${project.id}-creative`}>Creative Tools</h3><div className="medipeel-detail__badges">{detail.creativeTools.map(tool => <span key={tool}>{tool}</span>)}</div></section>
      </div>
    </div>
    <section className="medipeel-detail__features" aria-labelledby={`${project.id}-features`}>
      <h3 id={`${project.id}-features`}>Key Features</h3>
      <div className="medipeel-detail__feature-grid">{detail.features.map(feature => <FeatureVideo key={feature.id} feature={feature} enabled={!isClosing} visibleOnly={detail.playback === 'visible'}/>)}</div>
    </section>
    <section className="medipeel-detail__challenges" aria-labelledby={`${project.id}-challenges`}>
      <h3 id={`${project.id}-challenges`}>Technical Challenges</h3>
      {detail.challenges.map(challenge => <article className="medipeel-detail__challenge" key={challenge.title}>
        <h4>{challenge.title}</h4><p>{challenge.problem}</p>
        <div className="medipeel-detail__solution"><h5>Solution</h5><p>{challenge.solution}</p></div>
      </article>)}
    </section>
    <div className="medipeel-detail__links">{project.links.map(link => <a className="sw-button sw-button--primary" key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label} <span aria-hidden="true">↗</span></a>)}<button className="sw-button sw-button--back" onClick={onClose}>Back to Works <span aria-hidden="true">↙</span></button></div>
  </article>;
}
