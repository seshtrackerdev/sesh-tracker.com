import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import { AuthProvider } from './hooks/useAuth'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import './styles/landing.css'
import './styles/navbar.css'

// Set up MSW or other dev tools if needed for development mode
// if (process.env.NODE_ENV === 'development') {
//   const { worker } = await import('./mocks/browser')
//   worker.start()
// }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer position="bottom-right" />
    </AuthProvider>
  </React.StrictMode>,
)
