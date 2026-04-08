import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'

const Layout = () => {
  const { pathname } = useLocation()

  useRevealOnScroll(pathname)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main" role="main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
