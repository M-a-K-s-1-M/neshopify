import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@mantine/core/styles.css';
import './index.css'

import { registerSW } from 'virtual:pwa-register'
import { ThemeProvider } from './providers/theme.tsx';

import App from './App.tsx'


registerSW({ immediate: true });


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
