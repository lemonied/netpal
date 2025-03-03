import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import FloatingAction from '@/components/FloatingAction';

const container = document.createElement('div');
document.body.appendChild(container);

createRoot(container).render(
  <StrictMode>
    <FloatingAction />
  </StrictMode>,
);