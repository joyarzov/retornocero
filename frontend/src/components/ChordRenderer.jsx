import React from 'react'
import { parseChordLine } from '../utils/transpose'

// Renders a single line that contains [chord] markers
function ChordLyricLine({ line }) {
  const segments = parseChordLine(line)

  if (segments.length === 0) {
    return <div className="lyric-line">{line || '\u00A0'}</div>
  }

  return (
    <div className="flex flex-wrap items-end leading-none mb-1">
      {segments.map((seg, idx) => (
        <span key={idx} className="inline-flex flex-col items-start mr-0">
          {/* Chord row */}
          <span className="chord-line text-blue-700 dark:text-orange-400 font-bold font-mono text-sm leading-tight">
            {seg.chord || '\u00A0'}
          </span>
          {/* Lyric row */}
          <span className="leading-snug">{seg.text || (seg.chord ? '\u00A0' : '')}</span>
        </span>
      ))}
    </div>
  )
}

// Main renderer — parses the full song content
export default function ChordRenderer({ content, fontSize = 18 }) {
  if (!content) return null

  const lines = content.split('\n')

  return (
    <div
      className="song-content font-serif whitespace-pre-wrap"
      style={{ fontSize: `${fontSize}px` }}
    >
      {lines.map((line, idx) => {
        // Empty line → spacer
        if (!line.trim()) {
          return <div key={idx} className="h-3" />
        }

        // Section header: {verse}, {chorus}, ## Header, etc.
        const sectionMatch = line.match(/^\{(.+?)\}$/) ||
                             line.match(/^##\s*(.+)$/) ||
                             line.match(/^==\s*(.+?)\s*==$/)
        if (sectionMatch) {
          return (
            <div key={idx} className="song-section-header text-gray-500 dark:text-gray-400 italic text-sm font-sans mt-5 mb-1">
              {sectionMatch[1]}
            </div>
          )
        }

        // Line with chords
        if (line.includes('[') && line.includes(']')) {
          return <ChordLyricLine key={idx} line={line} />
        }

        // Pure lyric line (no chords)
        return (
          <div key={idx} className="leading-snug mb-0.5">
            {line}
          </div>
        )
      })}
    </div>
  )
}
