import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import App from './App';

class NetPalElement extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });

    const cache = createCache({
      key: 'css',
      prepend: true,
      container: shadowRoot,
    });

    const mountPoint = document.createElement('div');
    shadowRoot.appendChild(mountPoint);

    createRoot(mountPoint).render(
      <StrictMode>
        <CacheProvider value={cache}>
          <App />
        </CacheProvider>
      </StrictMode>,
    );
  }
}

customElements.define('netpal-panel-trigger', NetPalElement);

document.body.appendChild(
  document.createElement('netpal-panel-trigger'),
);
