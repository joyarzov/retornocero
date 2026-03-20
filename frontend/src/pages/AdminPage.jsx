import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { Plus, Edit2, Trash2, Users, Music, Check, X, Shield, ShieldOff } from 'lucide-react'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', is_admin: false })
  const [showNewUser, setShowNewUser] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      const [usersRes, songsRes] = await Promise.all([
        api.get('/api/users/'),
        api.get('/api/songs/')
      ])
      setUsers(usersRes.data)
      setSongs(songsRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDeleteUser = async (id, username) => {
    if (!confirm(`¿Eliminar usuario ${username}?`)) return
    try {
      await api.delete(`/api/users/${id}`)
      setUsers(u => u.filter(x => x.id !== id))
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al eliminar')
    }
  }

  const handleToggleAdmin = async (user) => {
    try {
      const res = await api.put(`/api/users/${user.id}`, { is_admin: !user.is_admin })
      setUsers(u => u.map(x => x.id === user.id ? res.data : x))
    } catch (e) {
      setError('Error al actualizar')
    }
  }

  const handleToggleActive = async (user) => {
    try {
      const res = await api.put(`/api/users/${user.id}`, { is_active: !user.is_active })
      setUsers(u => u.map(x => x.id === user.id ? res.data : x))
    } catch (e) {
      setError('Error al actualizar')
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) {
      setError('Usuario y contraseña son obligatorios')
      return
    }
    try {
      const res = await api.post('/api/users/', newUser)
      setUsers(u => [...u, res.data])
      setNewUser({ username: '', full_name: '', password: '', is_admin: false })
      setShowNewUser(false)
      setError('')
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al crear usuario')
    }
  }

  const handleSavePassword = async (userId) => {
    if (!editingUser?.password) return
    try {
      await api.put(`/api/users/${userId}`, { password: editingUser.password })
      setEditingUser(null)
    } catch (e) {
      setError('Error al actualizar contraseña')
    }
  }

  const handleDeleteSong = async (id, title) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return
    try {
      await api.delete(`/api/songs/${id}`)
      setSongs(s => s.filter(x => x.id !== id))
    } catch (e) {
      setError('Error al eliminar canción')
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-orange-400" />
    </div>
  )

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Panel de administración</h1>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-gray-900 border border-blue-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600 dark:text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-blue-700 dark:text-orange-400">{users.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Usuarios</div>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-gray-900 border border-blue-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-blue-600 dark:text-orange-400" />
            <div>
              <div className="text-2xl font-bold text-blue-700 dark:text-orange-400">{songs.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Canciones</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-orange-400" />
            Usuarios
          </h2>
          <button
            onClick={() => setShowNewUser(n => !n)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </button>
        </div>

        {showNewUser && (
          <div className="mb-4 p-4 rounded-xl border border-blue-200 dark:border-gray-700 bg-blue-50 dark:bg-gray-900 space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Nuevo usuario</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={e => setNewUser(u => ({ ...u, username: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Nombre completo"
                value={newUser.full_name}
                onChange={e => setNewUser(u => ({ ...u, full_name: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={newUser.password}
                onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUser.is_admin}
                    onChange={e => setNewUser(u => ({ ...u, is_admin: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Admin</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateUser}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-orange-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                Crear
              </button>
              <button
                onClick={() => setShowNewUser(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  user.is_admin
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {(user.full_name || user.username).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{user.full_name || user.username}</span>
                    {user.is_admin && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">Admin</span>
                    )}
                    {!user.is_active && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">Inactivo</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">@{user.username}</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {editingUser?.id === user.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      value={editingUser.password || ''}
                      onChange={e => setEditingUser(u => ({ ...u, password: e.target.value }))}
                      className="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button onClick={() => handleSavePassword(user.id)} className="p-1.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditingUser(null)} className="p-1.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingUser({ id: user.id, password: '' })}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 transition-colors text-xs"
                      title="Cambiar contraseña"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {user.username !== 'joyarzo' && (
                      <>
                        <button
                          onClick={() => handleToggleAdmin(user)}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title={user.is_admin ? 'Quitar admin' : 'Dar admin'}
                        >
                          {user.is_admin
                            ? <Shield className="w-3.5 h-3.5 text-blue-500" />
                            : <ShieldOff className="w-3.5 h-3.5 text-gray-400" />
                          }
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Songs section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
          <Music className="w-5 h-5 text-blue-600 dark:text-orange-400" />
          Canciones ({songs.length})
        </h2>
        <div className="space-y-2">
          {songs.map(song => (
            <div
              key={song.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{song.title}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{song.artist} {song.key && `· ${song.key}`}</div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={`/retornocero/songs/${song.id}/edit`}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDeleteSong(song.id, song.title)}
                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
