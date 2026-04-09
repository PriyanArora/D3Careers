import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import LoginPromptModal from './LoginPromptModal'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)

  const navItems = [
    { label: 'Pathways', to: '/pathways' },
    { label: 'Alumni', to: '/alumni' },
  ]

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 14)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    closeMenu()
    logout()
    navigate('/login')
  }

  const handleGuestDashboardClick = () => {
    closeMenu()
    setLoginPromptOpen(true)
  }

  return (
    <header className="sticky top-0 z-50 px-4 py-4 sm:px-8">
      <div
        className={`mx-auto flex w-full max-w-305 items-center rounded-[22px] border-[3px] border-black bg-[#f7f3f4f2] px-4 py-3 transition-all duration-300 sm:px-6 ${
          isScrolled ? 'shadow-[6px_6px_0_#000]' : ''
        }`}
      >
        <RouterLink to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <span className="font-['Epilogue'] text-[28px] font-extrabold leading-none tracking-[-0.03em] text-black">
            D3Careers
          </span>
        </RouterLink>

        <nav className="ml-auto hidden items-center gap-8 font-semibold text-black xl:flex">
          {navItems.map((item) => (
            <RouterLink
              key={item.to}
              to={item.to}
              className="text-[15px] transition-opacity hover:opacity-70"
              onClick={closeMenu}
            >
              {item.label}
            </RouterLink>
          ))}
        </nav>

        <div className="ml-6 hidden items-center gap-2 xl:flex">
          {user ? (
            <>
              <RouterLink
                to="/dashboard"
                className="px-1 text-[15px] font-semibold text-black transition-opacity hover:opacity-70"
                onClick={closeMenu}
              >
                Dashboard
              </RouterLink>
              <button
                type="button"
                className="inline-flex border-[3px] border-black bg-[#f8d6b3] px-4 py-2 font-semibold text-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="px-1 text-[15px] font-semibold text-black transition-opacity hover:opacity-70"
                onClick={handleGuestDashboardClick}
              >
                Dashboard
              </button>
              <RouterLink
                to="/login"
                className="inline-flex border-[3px] border-black bg-white px-4 py-2 font-semibold text-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5"
              >
                Login
              </RouterLink>
              <RouterLink
                to="/register"
                className="inline-flex border-[3px] border-black bg-[#f7de5a] px-4 py-2 font-semibold text-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5"
              >
                Register
              </RouterLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border-[3px] border-black bg-[#f7de5a] text-black shadow-[4px_4px_0_#000] xl:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="mx-auto mt-3 w-full max-w-305 rounded-[22px] border-[3px] border-black bg-[#f7f3f4] p-4 shadow-[6px_6px_0_#000] xl:hidden">
          <nav className="flex flex-col gap-3 font-semibold text-black">
            {navItems.map((item) => (
              <RouterLink
                key={item.to}
                to={item.to}
                className="rounded-xl border-2 border-black bg-white px-4 py-3"
                onClick={closeMenu}
              >
                {item.label}
              </RouterLink>
            ))}
            {user ? (
              <>
                <RouterLink
                  to="/dashboard"
                  className="rounded-xl border-2 border-black bg-white px-4 py-3"
                  onClick={closeMenu}
                >
                  Dashboard
                </RouterLink>
                <button
                  type="button"
                  className="rounded-xl border-2 border-black bg-[#f8d6b3] px-4 py-3 text-left"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded-xl border-2 border-black bg-white px-4 py-3 text-left"
                  onClick={handleGuestDashboardClick}
                >
                  Dashboard
                </button>
                <RouterLink to="/login" className="rounded-xl border-2 border-black bg-white px-4 py-3" onClick={closeMenu}>
                  Login
                </RouterLink>
                <RouterLink to="/register" className="rounded-xl border-2 border-black bg-[#f7de5a] px-4 py-3" onClick={closeMenu}>
                  Register
                </RouterLink>
              </>
            )}
          </nav>
        </div>
      )}

      <LoginPromptModal
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        titleText="Access your dashboard"
        descriptionText="Sign in to view your saved paths, sessions, and progress."
      />
    </header>
  )
}

export default Navbar
