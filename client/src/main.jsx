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
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { RouterErrorPage } from './components/ErrorBoundary'

const router = createBrowserRouter([
  { path: '/',             element: <HomePage />,                                          errorElement: <RouterErrorPage /> },
  { path: '/pathways',     element: <PathwaysPage />,                                      errorElement: <RouterErrorPage /> },
  { path: '/alumni',       element: <AlumniPage />,                                        errorElement: <RouterErrorPage /> },
  { path: '/alumni/:id',   element: <AlumniProfilePage />,                                 errorElement: <RouterErrorPage /> },
  { path: '/dashboard',    element: <ProtectedRoute> <DashboardPage /> </ProtectedRoute>,  errorElement: <RouterErrorPage /> },
  { path: '/login',        element: <LoginPage />,                                         errorElement: <RouterErrorPage /> },
  { path: '/register',     element: <RegisterPage />,                                      errorElement: <RouterErrorPage /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider><RouterProvider router={router} /></AuthProvider>
  </StrictMode>
)
