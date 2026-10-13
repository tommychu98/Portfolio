import './ui.css';
export default function Button({children, className='', ...props}) {
  return <button type="button" className={`ui-button ${className}`} {...props}>{children}</button>;
}
