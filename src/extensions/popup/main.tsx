import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.createElement('div');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

document.body.appendChild(container);
