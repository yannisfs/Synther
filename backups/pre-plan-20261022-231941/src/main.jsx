import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n/config.js' // Side-effect: initializes i18next + sets <html lang>.
import App from './App.jsx'
import './styles.css'
import './components.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)