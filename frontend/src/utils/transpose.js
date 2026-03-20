// Chord transposition utilities

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTES_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

function getNoteIndex(note) {
  let idx = NOTES_SHARP.indexOf(note)
  if (idx === -1) idx = NOTES_FLAT.indexOf(note)
  return idx
}

function transposeNote(note, semitones) {
  const idx = getNoteIndex(note)
  if (idx === -1) return note
  const newIdx = ((idx + semitones) % 12 + 12) % 12
  // Prefer sharps for positive, flats for negative
  return semitones >= 0 ? NOTES_SHARP[newIdx] : NOTES_FLAT[newIdx]
}

export function transposeChord(chord, semitones) {
  if (semitones === 0) return chord
  // Match note (e.g. C#, Db, G) followed by optional chord quality
  // Handles: C, Cm, C#m, Db7, Gmaj7, F#sus4, etc.
  const match = chord.match(/^([A-G][#b]?)(.*)$/)
  if (!match) return chord
  const [, note, quality] = match
  return transposeNote(note, semitones) + quality
}

export function transposeLine(line, semitones) {
  if (semitones === 0) return line
  // Replace all [CHORD] occurrences
  return line.replace(/\[([^\]]+)\]/g, (_, chord) => `[${transposeChord(chord, semitones)}]`)
}

export function transposeContent(content, semitones) {
  if (semitones === 0) return content
  return content
    .split('\n')
    .map(line => transposeLine(line, semitones))
    .join('\n')
}

export function transposeKey(key, semitones) {
  if (!key || semitones === 0) return key
  return transposeChord(key, semitones)
}

// Parse content into renderable blocks
// Format: lines with [chord] markers before syllables
// Section headers like {verse}, {chorus}, etc.
export function parseContent(content) {
  const lines = content.split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Section header: {verse}, {chorus}, [Verse 1], etc.
    const sectionMatch = line.match(/^\{(.+?)\}$/) || line.match(/^\[([A-Z][^\]]+)\]$/)
    if (sectionMatch) {
      blocks.push({ type: 'section', label: sectionMatch[1] })
      i++
      continue
    }

    // Check if line has chord markers
    if (line.includes('[') && line.includes(']')) {
      // Parse chord+lyric line
      blocks.push({ type: 'chord-lyric', raw: line, next: lines[i + 1] || '' })
      // If next line doesn't have chords, it's the lyric line — skip it
      // Actually we'll handle inline
      i++
      continue
    }

    // Regular lyric line
    if (line.trim()) {
      blocks.push({ type: 'lyric', text: line })
    } else {
      blocks.push({ type: 'empty' })
    }
    i++
  }

  return blocks
}

// Render a chord-annotated line into segments: [{chord, text}]
export function parseChordLine(line) {
  const segments = []
  const regex = /\[([^\]]+)\]([^\[]*)/g
  let match
  let lastIndex = 0

  // Check if line starts with text before first chord
  const firstChordIdx = line.indexOf('[')
  if (firstChordIdx > 0) {
    segments.push({ chord: '', text: line.substring(0, firstChordIdx) })
  }

  while ((match = regex.exec(line)) !== null) {
    segments.push({
      chord: match[1],
      text: match[2]
    })
  }

  return segments
}
