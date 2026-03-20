import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import ChordRenderer from '../components/ChordRenderer'

const KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
              'Cm', 'C#m', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bbm', 'Bm']

export default function SongEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [form, setForm] = useState({
    title: '',
    artist: '',
    key: '',
    capo: 0,
    content: '',
    youtube_url: '',
    notes: '',
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) {
      api.get(`/api/songs/${id}`)
        .then(res => {
          const s = res.data
          setForm({
            title: s.title || '',
            artist: s.artist || '',
            key: s.key || '',
            capo: s.capo || 0,
            content: s.content || '',
            youtube_url: s.youtube_url || '',
            notes: s.notes || '',
          })
        })
        .catch(() => navigate('/retornocero/'))
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.title || !form.content) {
      setError('El título y el contenido son obligatorios')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (isNew) {
        const res = await api.post('/api/songs/', form)
        navigate(`/retornocero/songs/${res.data.id}`)
      } else {
        await api.put(`/api/songs/${id}`, form)
        navigate(`/retornocero/songs/${id}`)
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al guardar')
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-orange-400" />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={isNew ? '/retornocero/' : `/retornocero/songs/${id}`}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isNew ? 'Nueva canción' : 'Editar canción'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(p => !p)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              preview
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            {preview ? 'Editar' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {preview ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-1">{form.title || 'Sin título'}</h2>
          <p className="text-gray-500 mb-6">{form.artist}</p>
          <ChordRenderer content={form.content} fontSize={18} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-400 text-sm"
                placeholder="Nombre de la canción"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Artista
              </label>
              <input
                type="text"
                value={form.artist}
                onChange={e => handleChange('artist', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-400 text-sm"
                placeholder="Nombre del artista"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tono
                </label>
                <select
                  value={form.key}
                  onChange={e => handleChange('key', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-400 text-sm"
                >
                  <option value="">Sin especificar</option>
                  {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cejilla
                </label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={form.capo}
                  onChange={e => handleChange('capo', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link de YouTube
              </label>
              <input
                type="url"
                value={form.youtube_url}
                onChange={e => handleChange('youtube_url', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-400 text-sm"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas
              </label>
              <textarea
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-400 text-sm resize-y"
                placeholder="Observaciones, intro, tempo, etc."
              />
            </div>
          </div>

          {/* Right: content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Letra con acordes *
              </label>
              <span className="text-xs text-gray-400">Formato: [G]letra [Am]de la [C]canción</span>
            </div>
            <textarea
              value={form.content}
              onChange={e => handleChange('content', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-400 text-sm font-mono resize-none"
              style={{ height: '500px' }}
              placeholder={`{Intro}\n[G] [D] [Em] [C]\n\n{Verse 1}\n[G]Esta es la [D]letra de la [Em]canción\n[C]con los acordes [G]encima\n\n{Chorus}\n[C]Esto es el [G]coro`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
