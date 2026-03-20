import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Download, Edit, Save, ArrowLeft } from 'lucide-react'
import ChordRenderer from '../components/ChordRenderer'

const KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
              'Cm', 'C#m', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm']

export default function ImportPage() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleImport = async () => {
    if (!url.trim()) return
    setImporting(true)
    setError('')
    setImported(null)
    try {
      const res = await api.post('/api/import/', { url: url.trim() })
      setImported(res.data)
      setEditing(false)
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al importar. Verifica la URL.')
    } finally {
      setImporting(false)
    }
  }

  const handleSave = async () => {
    if (!imported) return
    setSaving(true)
    try {
      const res = await api.post('/api/songs/', {
        title: imported.title,
        artist: imported.artist,
        key: imported.key || '',
        capo: 0,
        content: imported.content,
        youtube_url: imported.youtube_url || '',
        notes: '',
        source_url: imported.source_url,
      })
      navigate(`/retornocero/songs/${res.data.id}`)
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al guardar')
      setSaving(false)
    }
  }

  const updateImported = (field, value) => {
    setImported(i => ({ ...i, [field]: value }))
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/retornocero/')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Importar canción
        </h1>
      </div>

      {/* URL Input */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          URL de CifraClub o Ultimate Guitar
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleImport()}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-400 text-sm"
            placeholder="https://www.cifraclub.com.br/artista/cancion/ o https://tabs.ultimate-guitar.com/..."
          />
          <button
            onClick={handleImport}
            disabled={importing || !url.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {importing ? 'Importando...' : 'Importar'}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          Pega la URL de la canción y extrae automáticamente título, artista, acordes y letra.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {imported && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Canción importada
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(e => !e)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  editing
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Edit className="w-4 h-4" />
                {editing ? 'Preview' : 'Editar'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar canción'}
              </button>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Título</label>
                  <input
                    type="text"
                    value={imported.title}
                    onChange={e => updateImported('title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Artista</label>
                  <input
                    type="text"
                    value={imported.artist}
                    onChange={e => updateImported('artist', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tono</label>
                  <select
                    value={imported.key || ''}
                    onChange={e => updateImported('key', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Sin especificar</option>
                    {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={imported.youtube_url || ''}
                    onChange={e => updateImported('youtube_url', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contenido</label>
                <textarea
                  value={imported.content}
                  onChange={e => updateImported('content', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-y"
                  style={{ height: '400px' }}
                />
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-1">{imported.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-2">{imported.artist}</p>
              {imported.key && (
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-orange-400 border border-blue-200 dark:border-gray-700 mb-4">
                  Tono: {imported.key}
                </span>
              )}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
                <ChordRenderer content={imported.content} fontSize={16} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
