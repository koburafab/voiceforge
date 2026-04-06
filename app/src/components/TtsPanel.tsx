import { useCallback, useRef } from 'react'
import { useAudioStore } from '../stores/audioStore'
import { synthesize } from '../api/client'
import { VoiceSelector } from './VoiceSelector'

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

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlay = useCallback(async () => {
    if (!ttsText.trim()) return

    // Stop current playback
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
      const buffer = await synthesize(ttsText, voice, provider, speed)
      const blob = new Blob([buffer], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      const audio = new Audio(url)
      audioRef.current = audio
      audio.onplay = () => setPlaying(true)
      audio.onended = () => setPlaying(false)
      audio.onpause = () => setPlaying(false)
      await audio.play()
    } catch (err) {
      alert(`Erreur TTS: ${err instanceof Error ? err.message : err}`)
    } finally {
      setGenerating(false)
    }
  }, [ttsText, voice, provider, speed, audioUrl, setGenerating, setPlaying, setAudioUrl])

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

  return (
    <div className="panel tts-panel">
      <textarea
        className="tts-textarea"
        value={ttsText}
        onChange={(e) => setTtsText(e.target.value)}
        placeholder="Colle ton texte ici..."
        rows={12}
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
              {isGenerating ? 'Generation...' : 'Play'}
            </button>
          )}
          {audioUrl && (
            <button className="btn btn--export" onClick={handleExport}>Export MP3</button>
          )}
        </div>
      </div>

      <div className="tts-info">
        {ttsText.length > 0 && <span>{ttsText.length} caracteres</span>}
      </div>
    </div>
  )
}
