import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { PosterProcess } from './poster/PosterProcess';

const poster = new URLSearchParams(window.location.search).get('poster');

createRoot(document.getElementById('root')!).render(<StrictMode>{poster === 'process' ? <PosterProcess /> : <App />}</StrictMode>);
