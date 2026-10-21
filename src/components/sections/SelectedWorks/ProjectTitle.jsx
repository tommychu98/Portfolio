export function ProjectName({ project }) {
  return <>{project.titleLines.map((line, i) => <span key={line} className={i ? 'sw-name__italic' : undefined}>{line}</span>)}</>;
}
export default function ProjectTitle({ project, onOpen }) {
  return <div className="sw-title" data-project-title>
    <p className="sw-category">{project.category}</p>
    <h3><button className="sw-name" onClick={onOpen} aria-label={`${project.name} 상세 열기`} aria-haspopup="dialog" aria-controls="selected-work-detail"><ProjectName project={project}/></button></h3>
    <div className="sw-actions">
      <button className="sw-button sw-button--primary" onClick={onOpen} aria-label={`${project.name} 상세 보기`} aria-haspopup="dialog" aria-controls="selected-work-detail">Details <span aria-hidden="true">＋</span></button>
      <a className="sw-button sw-button--website" href={project.links[0].href} target="_blank" rel="noopener noreferrer">Visit Website <span aria-hidden="true">↗</span></a>
    </div>
  </div>;
}
