import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Music, Sun, Moon, LogOut, Settings, Upload, List } from 'lucide-react'

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/retornocero/login')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/retornocero/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            <Music className="w-6 h-6 text-blue-600 dark:text-orange-400" />
            <span className="text-blue-700 dark:text-orange-400">Retorno</span>
            <span className="text-gray-900 dark:text-gray-100">Cero</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/retornocero/"
              className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                location.pathname === '/retornocero/' || location.pathname === '/retornocero'
                  ? 'bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Canciones</span>
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/retornocero/import"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                    location.pathname === '/retornocero/import'
                      ? 'bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-orange-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Importar</span>
                </Link>
                <Link
                  to="/retornocero/admin"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                    location.pathname === '/retornocero/admin'
                      ? 'bg-blue-50 dark:bg-gray-800 text-blue-700 dark:text-orange-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
              {user?.full_name || user?.username}
            </span>
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
