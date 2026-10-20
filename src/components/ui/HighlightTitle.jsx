import './HighlightTitle.css';

// Presentation only: the section continues to own its existing reveal animation.
export default function HighlightTitle({ as: Tag = 'h2', scale = 'section', className = '', children, ...props }) {
  return <Tag className={`display highlight-title highlight-title--${scale} ${className}`.trim()} {...props}>{children}</Tag>;
}

export function TitleLine({ className = '', children, ...props }) {
  return <span className={`highlight-title__line ${className}`.trim()} {...props}>{children}</span>;
}

export function TitleHighlight({ as: Tag = 'span', className = '', children, ...props }) {
  return <Tag className={`highlight-title__paper ${className}`.trim()} {...props}>{children}</Tag>;
}
