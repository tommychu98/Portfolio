import ProjectCards from './ProjectCards';
import ProjectTitle from './ProjectTitle';
export default function CardStage({ projects, active, onOpen, onSelect }) {
  return <div className="sw-stage" data-stage>
    <div className="sw-stage__label"><span>PERSONAL WORKS</span><span>SELECTED PROJECTS</span></div>
    <div className="sw-scenes">{projects.map((project, index) => <article className="sw-scene" data-project={project.id} key={project.id} style={{'--sw-accent':project.accent,'--sw-foreground':project.foreground}}>
      <div className="sw-orbit" data-orbit><ProjectCards project={project} active={active === index}/></div>
      <ProjectTitle project={project} onOpen={event => onOpen(index, event)}/>
    </article>)}</div>
    <nav className="sw-navigation" aria-label="개인 프로젝트 탐색">
      <span className="sw-scroll-hint">SCROLL TO EXPLORE ↓</span>
      <div>{projects.map((project, index) => <button key={project.id} aria-current={active === index ? 'true' : undefined} onClick={() => onSelect(index)}>{project.name}</button>)}</div>
      <div className="sw-navigation__arrows"><button onClick={() => onSelect(active - 1)} disabled={active === 0} aria-label="이전 프로젝트">←</button><button onClick={() => onSelect(active + 1)} disabled={active === projects.length - 1} aria-label="다음 프로젝트">→</button></div>
    </nav>
  </div>;
}
