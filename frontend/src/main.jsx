import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ConfiguracionProvider } from './context/ConfiguracionContext'
import AppRoutes from './routes/AppRoutes'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ConfiguracionProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </ConfiguracionProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)