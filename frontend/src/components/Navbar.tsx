import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { STUDY_FEATURE_ENABLED } from '../config/features'
import VoxelCube from './VoxelCube'

function lastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return parts.length > 0 ? parts[parts.length - 1] : 'Profile'
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, currentUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const brandName = lastName(currentUser?.full_name || '')

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login')
  }

  const linkClass = 'hover:text-fire-500 py-2 md:py-0'

  return (
    <nav className="bg-earth-950 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white" onClick={() => setMenuOpen(false)}>
          <VoxelCube size={24} />
          {brandName}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-4 items-center">
          {isAuthenticated ? (
            <>
              <Link to="/blog" className={linkClass}>
                Blog
              </Link>
              {STUDY_FEATURE_ENABLED && (
                <Link to="/study" className={linkClass}>
                  Study
                </Link>
              )}
              {STUDY_FEATURE_ENABLED && isAdmin && (
                <Link to="/admin/study" className={linkClass}>
                  Admin
                </Link>
              )}
              <button type="button" onClick={handleLogout} className="btn-primary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Login
              </Link>
              <Link to="/register" className="bg-earth-500 hover:bg-earth-400 px-3 py-1.5 rounded-md text-sm">
                Register
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="text-lg leading-none rounded-full w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="text-lg leading-none rounded-full w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-3 flex flex-col border-t border-white/10 pt-3">
          {isAuthenticated ? (
            <>
              <Link to="/blog" className={linkClass} onClick={() => setMenuOpen(false)}>
                Blog
              </Link>
              {STUDY_FEATURE_ENABLED && (
                <Link to="/study" className={linkClass} onClick={() => setMenuOpen(false)}>
                  Study
                </Link>
              )}
              {STUDY_FEATURE_ENABLED && isAdmin && (
                <Link to="/admin/study" className={linkClass} onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <button type="button" onClick={handleLogout} className="btn-primary mt-2 self-start">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link
                to="/register"
                className="bg-earth-500 hover:bg-earth-400 px-3 py-1.5 rounded-md text-sm mt-2 self-start"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
