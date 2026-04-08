import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PathwaysPage from './pages/PathwaysPage'
import AlumniPage from './pages/AlumniPage'
import AlumniProfilePage from './pages/AlumniProfilePage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { RouterErrorPage } from './components/ErrorBoundary'
import Layout from './components/Layout'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouterErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pathways', element: <PathwaysPage /> },
      { path: 'alumni', element: <AlumniPage /> },
      { path: 'alumni/:id', element: <AlumniProfilePage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider><RouterProvider router={router} /></AuthProvider>
  </StrictMode>
)
