import { renderToStaticMarkup } from 'react-dom/server';
import App from '../src/App';
export function render(){return renderToStaticMarkup(<App/>);}
