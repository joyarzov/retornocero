import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import { Search, Music, Youtube, Plus, Filter } from 'lucide-react'

const KEYS = ['C', 'C#', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
              'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm']

export default function SongListPage() {
  const { isAdmin } = useAuth()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterKey, setFilterKey] = useState('')

  const fetchSongs = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (filterKey) params.key = filterKey
      const res = await api.get('/api/songs/', { params })
      setSongs(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchSongs, 300)
    return () => clearTimeout(t)
  }, [search, filterKey])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Canciones
        </h1>
        {isAdmin && (
          <Link
            to="/retornocero/songs/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva canción
          </Link>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título o artista..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-400 text-sm transition"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterKey}
            onChange={e => setFilterKey(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-400 text-sm transition appearance-none"
          >
            <option value="">Todos los tonos</option>
            {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* Song list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-orange-400" />
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <Music className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No hay canciones todavía</p>
          {isAdmin && (
            <p className="text-sm mt-2">
              <Link to="/retornocero/import" className="text-blue-600 dark:text-orange-400 hover:underline">
                Importa una canción
              </Link>
              {' '}o{' '}
              <Link to="/retornocero/songs/new" className="text-blue-600 dark:text-orange-400 hover:underline">
                créala manualmente
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map(song => (
            <Link
              key={song.id}
              to={`/retornocero/songs/${song.id}`}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-orange-500/50 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-gray-700 transition-colors">
                  <Music className="w-5 h-5 text-blue-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {song.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {song.artist}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                {song.youtube_url && (
                  <Youtube className="w-4 h-4 text-red-500 opacity-70" />
                )}
                {song.key && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-orange-400 border border-blue-200 dark:border-gray-700">
                    {song.key}
                    {song.capo > 0 && ` (Cejilla ${song.capo})`}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {songs.length > 0 && (
        <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-600">
          {songs.length} {songs.length === 1 ? 'canción' : 'canciones'}
        </div>
      )}
    </div>
  )
}
