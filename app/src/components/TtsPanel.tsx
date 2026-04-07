import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudioStore } from '../stores/audioStore'
import { synthesize } from '../api/client'
import { VoiceSelector } from './VoiceSelector'
import { splitText, estimateCost } from '../utils/textSplitter'
import { cleanForTts } from '../utils/textCleaner'

export function TtsPanel() {
  const ttsText = useAudioStore((s) => s.ttsText)
  const setTtsText = useAudioStore((s) => s.setTtsText)
  const voice = useAudioStore((s) => s.voice)
  const provider = useAudioStore((s) => s.provider)
  const speed = useAudioStore((s) => s.speed)
  const setSpeed = useAudioStore((s) => s.setSpeed)
  const isGenerating = useAudioStore((s) => s.isGenerating)
  const setGenerating = useAudioStore((s) => s.setGenerating)
  const isPlaying = useAudioStore((s) => s.isPlaying)
  const setPlaying = useAudioStore((s) => s.setPlaying)
  const audioUrl = useAudioStore((s) => s.audioUrl)
  const setAudioUrl = useAudioStore((s) => s.setAudioUrl)
  const generateProgress = useAudioStore((s) => s.generateProgress)
  const setGenerateProgress = useAudioStore((s) => s.setGenerateProgress)
  const addHistory = useAudioStore((s) => s.addHistory)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handlePlay = useCallback(async () => {
    if (!ttsText.trim()) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }

    setGenerating(true)
    try {
      const cleaned = cleanForTts(ttsText)
      if (!cleaned.trim()) {
        alert('Aucun texte lisible apres nettoyage')
        setGenerating(false)
        return
      }
      const chunks = splitText(cleaned)
      const blobs: Blob[] = []

      for (let i = 0; i < chunks.length; i++) {
        if (chunks.length > 1) {
          setGenerateProgress(`Partie ${i + 1}/${chunks.length}...`)
        }
        const buffer = await synthesize(chunks[i], voice, provider, speed)
        blobs.push(new Blob([buffer], { type: 'audio/mpeg' }))
      }

      setGenerateProgress(null)
      const fullBlob = new Blob(blobs, { type: 'audio/mpeg' })
      const url = URL.createObjectURL(fullBlob)
      setAudioUrl(url)

      const audio = new Audio(url)
      audioRef.current = audio
      audio.onplay = () => setPlaying(true)
      audio.onended = () => setPlaying(false)
      audio.onpause = () => setPlaying(false)
      await audio.play()

      // Add to history
      addHistory({
        id: crypto.randomUUID(),
        text: ttsText.slice(0, 200),
        voice,
        provider,
        timestamp: Date.now(),
      })
      // Persist history to backend
      fetch('http://localhost:3002/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText.slice(0, 200),
          voice,
          provider,
          timestamp: Date.now(),
        }),
      }).catch(() => {})
    } catch (err) {
      alert(`Erreur TTS: ${err instanceof Error ? err.message : err}`)
    } finally {
      setGenerating(false)
      setGenerateProgress(null)
    }
  }, [ttsText, voice, provider, speed, audioUrl, setGenerating, setPlaying, setAudioUrl, setGenerateProgress, addHistory])

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setPlaying(false)
  }, [setPlaying])

  const handleExport = useCallback(() => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `voiceforge-${Date.now()}.mp3`
    a.click()
  }, [audioUrl])

  // Keyboard shortcut: Ctrl+Enter = play
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).type === 'voiceforge:play') handlePlay()
    }
    window.addEventListener('voiceforge:play', handler)
    return () => window.removeEventListener('voiceforge:play', handler)
  }, [handlePlay])

  // Drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length === 0) return

    const file = files[0]
    if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target?.result as string
        if (content) setTtsText(content)
      }
      reader.readAsText(file)
    } else {
      alert('Format supporte: .txt, .md')
    }
  }, [setTtsText])

  const cost = estimateCost(ttsText, provider)
  const chunks = splitText(ttsText)

  return (
    <div className="panel tts-panel">
      <textarea
        className={`tts-textarea ${isDragging ? 'tts-textarea--dragging' : ''}`}
        value={ttsText}
        onChange={(e) => setTtsText(e.target.value)}
        placeholder="Colle ton texte ici ou drop un fichier .txt / .md"
        rows={12}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      <div className="tts-controls">
        <VoiceSelector />

        <div className="speed-control">
          <label>Vitesse: {speed.toFixed(1)}x</label>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </div>

        <div className="tts-buttons">
          {isPlaying ? (
            <button className="btn btn--stop" onClick={handleStop}>Stop</button>
          ) : (
            <button
              className="btn btn--play"
              onClick={handlePlay}
              disabled={isGenerating || !ttsText.trim()}
            >
              {isGenerating ? (generateProgress || 'Generation...') : 'Play'}
            </button>
          )}
          {audioUrl && (
            <button className="btn btn--export" onClick={handleExport}>Export MP3</button>
          )}
        </div>
      </div>

      <div className="tts-info">
        {ttsText.length > 0 && (
          <>
            <span>{ttsText.length} caracteres</span>
            {chunks.length > 1 && <span> · {chunks.length} parties</span>}
            {cost && <span> · {cost}</span>}
          </>
        )}
      </div>
    </div>
  )
}
