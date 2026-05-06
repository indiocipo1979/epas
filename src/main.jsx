// ─── main.jsx ───
// Punto de entrada de la aplicación React.
// Monta el componente App en el div #root del index.html

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
