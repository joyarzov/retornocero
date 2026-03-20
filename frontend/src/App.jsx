import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './pages/LoginPage'
import SongListPage from './pages/SongListPage'
import SongViewPage from './pages/SongViewPage'
import SongEditPage from './pages/SongEditPage'
import AdminPage from './pages/AdminPage'
import ImportPage from './pages/ImportPage'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-orange-400" />
    </div>
  )
  if (!user) return <Navigate to="/retornocero/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/retornocero/" replace />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/retornocero/login" element={<LoginPage />} />
            <Route path="/retornocero/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route index element={<SongListPage />} />
                    <Route path="songs/:id" element={<SongViewPage />} />
                    <Route path="songs/new" element={
                      <AdminRoute><SongEditPage /></AdminRoute>
                    } />
                    <Route path="songs/:id/edit" element={
                      <AdminRoute><SongEditPage /></AdminRoute>
                    } />
                    <Route path="import" element={
                      <AdminRoute><ImportPage /></AdminRoute>
                    } />
                    <Route path="admin" element={
                      <AdminRoute><AdminPage /></AdminRoute>
                    } />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/retornocero/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
