import React from 'react'
import ReactDOM from 'react-dom/client'
import './style.css'
import './theme.js'
import DocsApp from './DocsApp'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DocsApp />
  </React.StrictMode>
)
