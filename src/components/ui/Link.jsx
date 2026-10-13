import './ui.css';
export default function Link({ href, children, className = '', ...props }) {
  const external = /^https?:/.test(href);
  return <a className={`text-link ${className}`} href={href} {...(external ? {target:'_blank',rel:'noopener noreferrer'} : {})} {...props}>
    <span className="text-link__window"><span>{children}</span><span aria-hidden="true">{children}</span></span>
    <span className="text-link__arrow" aria-hidden="true">{external ? '↗' : '↗'}</span>
    {external && <span className="sr-only"> (새 창)</span>}
  </a>;
}
