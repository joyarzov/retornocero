import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import ChordRenderer from '../components/ChordRenderer'
import { transposeContent, transposeKey } from '../utils/transpose'
import {
  ArrowLeft, Edit, Trash2, Youtube, ChevronUp, ChevronDown,
  Play, Pause, Settings, Minus, Plus, ExternalLink
} from 'lucide-react'

export default function SongViewPage() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [song, setSong] = useState(null)
  const [loading, setLoading] = useState(true)
  const [semitones, setSemitones] = useState(0)
  const [fontSize, setFontSize] = useState(18)
  const [autoScroll, setAutoScroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(30) // px per second
  const [showSettings, setShowSettings] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const scrollRef = useRef(null)
  const animRef = useRef(null)
  const lastTimeRef = useRef(null)

  useEffect(() => {
    api.get(`/api/songs/${id}`)
      .then(res => setSong(res.data))
      .catch(() => navigate('/retornocero/'))
      .finally(() => setLoading(false))
  }, [id])

  // Auto-scroll logic
  const doScroll = useCallback((timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp
    const delta = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp
    window.scrollBy(0, (scrollSpeed * delta) / 1000)
    animRef.current = requestAnimationFrame(doScroll)
  }, [scrollSpeed])

  useEffect(() => {
    if (autoScroll) {
      lastTimeRef.current = null
      animRef.current = requestAnimationFrame(doScroll)
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [autoScroll, doScroll])

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${song.title}"?`)) return
    setDeleting(true)
    try {
      await api.delete(`/api/songs/${id}`)
      navigate('/retornocero/')
    } catch {
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-orange-400" />
    </div>
  )

  if (!song) return null

  const transposedContent = transposeContent(song.content, semitones)
  const currentKey = transposeKey(song.key, semitones)

  return (
    <div ref={scrollRef}>
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/retornocero/"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {song.title}
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-gray-500 dark:text-gray-400">{song.artist}</span>
              {currentKey && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-orange-400 border border-blue-200 dark:border-gray-700">
                  {currentKey}
                  {song.capo > 0 && ` · Cejilla ${song.capo}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {song.youtube_url && (
            <a
              href={song.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
            >
              <Youtube className="w-4 h-4" />
              <span className="hidden sm:inline">YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {isAdmin && (
            <>
              <Link
                to={`/retornocero/songs/${id}/edit`}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                title="Editar"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500"
                title="Eliminar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Controls bar */}
      <div className="sticky top-14 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 -mx-4 px-4 py-2 mb-6 flex flex-wrap items-center gap-3">
        {/* Transpose */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1 font-sans">Tono</span>
          <button
            onClick={() => setSemitones(s => s - 1)}
            className="w-7 h-7 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-8 text-center text-sm font-mono font-bold text-blue-700 dark:text-orange-400">
            {semitones > 0 ? `+${semitones}` : semitones}
          </span>
          <button
            onClick={() => setSemitones(s => s + 1)}
            className="w-7 h-7 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <Plus className="w-3 h-3" />
          </button>
          {semitones !== 0 && (
            <button
              onClick={() => setSemitones(0)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-1"
            >
              Reset
            </button>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-700" />

        {/* Auto-scroll */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(a => !a)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              autoScroll
                ? 'bg-blue-600 dark:bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {autoScroll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            Auto-scroll
          </button>
          {autoScroll && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setScrollSpeed(s => Math.max(5, s - 5))}
                className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <span className="text-xs font-mono w-8 text-center text-gray-600 dark:text-gray-400">{scrollSpeed}</span>
              <button
                onClick={() => setScrollSpeed(s => Math.min(120, s + 5))}
                className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 dark:bg-gray-700" />

        {/* Font size */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFontSize(s => Math.max(12, s - 2))}
            className="w-7 h-7 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize(s => Math.min(36, s + 2))}
            className="w-7 h-7 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold"
          >
            A+
          </button>
        </div>
      </div>

      {/* Notes */}
      {song.notes && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Notas:</strong> {song.notes}
        </div>
      )}

      {/* Song content */}
      <div className="pb-32">
        <ChordRenderer content={transposedContent} fontSize={fontSize} />
      </div>

      {/* Bottom spacer for scroll */}
      <div className="h-screen" />
    </div>
  )
}
