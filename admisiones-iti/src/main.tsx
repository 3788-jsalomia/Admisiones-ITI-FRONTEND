import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Importa en tu index.tsx o App.tsx
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // tema
import 'primereact/resources/primereact.min.css';                 // estilos base de PrimeReact
import 'primeicons/primeicons.css';                               // íconos


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
