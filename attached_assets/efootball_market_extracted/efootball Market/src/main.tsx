// Ensure window.fetch can be safely assigned by polyfills without getter-only errors
if (typeof window !== 'undefined' && window.fetch) {
  try {
    let _fetch = window.fetch.bind(window);
    Object.defineProperty(window, 'fetch', {
      get: () => _fetch,
      set: (fn) => {
        _fetch = fn;
      },
      configurable: true,
      enumerable: true,
    });
  } catch {
    // Ignore error if already configured
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
