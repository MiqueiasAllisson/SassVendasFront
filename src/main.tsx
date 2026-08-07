import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { brand } from './config/brand';
import './index.css';
import { applyBrandColor } from './lib/theme';

// Aplica a cor da marca antes do primeiro render — evita o "flash" da paleta
// padrão em instalações com identidade visual própria.
applyBrandColor(brand.primaryColor);
document.title = brand.name;

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado no index.html.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
