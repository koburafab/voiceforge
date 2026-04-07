import { useCallback, useRef, useState } from 'react'
import { useAudioStore, type Provider } from '../stores/audioStore'
import { synthesize } from '../api/client'

const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy' },
  { id: 'ash', name: 'Ash' },
  { id: 'coral', name: 'Coral' },
  { id: 'echo', name: 'Echo' },
  { id: 'fable', name: 'Fable' },
  { id: 'nova', name: 'Nova' },
  { id: 'onyx', name: 'Onyx' },
  { id: 'sage', name: 'Sage' },
  { id: 'shimmer', name: 'Shimmer' },
]

const ELEVENLABS_VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (F)' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (M)' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice (F)' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda (F)' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric (M)' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (M)' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura (F)' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger (M)' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River (N)' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica (F)' },
]

// Cache previews in memory
const previewCache = new Map<string, string>()

export function VoiceSelector() {
  const voice = useAudioStore((s) => s.voice)
  const setVoice = useAudioStore((s) => s.setVoice)
  const provider = useAudioStore((s) => s.provider)
  const setProvider = useAudioStore((s) => s.setProvider)
  const [previewing, setPreviewing] = useState(false)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)

  const voices = provider === 'openai' ? OPENAI_VOICES : ELEVENLABS_VOICES

  const handleProviderChange = (p: Provider) => {
    setProvider(p)
    setVoice(p === 'openai' ? 'nova' : 'EXAVITQu4vr4xnSDxMaL')
  }

  const handlePreview = useCallback(async () => {
    const cacheKey = `${provider}:${voice}`

    // Stop previous preview
    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
      previewAudioRef.current = null
    }

    // Check cache
    if (previewCache.has(cacheKey)) {
      const audio = new Audio(previewCache.get(cacheKey)!)
      previewAudioRef.current = audio
      audio.play()
      return
    }

    setPreviewing(true)
    try {
      const text = `Bonjour, je suis la voix ${voice}.`
      const buffer = await synthesize(text, voice, provider, 1)
      const blob = new Blob([buffer], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      previewCache.set(cacheKey, url)

      const audio = new Audio(url)
      previewAudioRef.current = audio
      audio.play()
    } catch (err) {
      alert(`Preview error: ${err instanceof Error ? err.message : err}`)
    } finally {
      setPreviewing(false)
    }
  }, [voice, provider])

  return (
    <div className="voice-selector">
      <div className="provider-tabs">
        <button
          className={`tab ${provider === 'openai' ? 'tab--active' : ''}`}
          onClick={() => handleProviderChange('openai')}
        >
          OpenAI
        </button>
        <button
          className={`tab ${provider === 'elevenlabs' ? 'tab--active' : ''}`}
          onClick={() => handleProviderChange('elevenlabs')}
        >
          ElevenLabs
        </button>
      </div>
      <select value={voice} onChange={(e) => setVoice(e.target.value)}>
        {voices.map((v) => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </select>
      <button
        className="btn btn--preview"
        onClick={handlePreview}
        disabled={previewing}
        title="Ecouter un sample de cette voix"
      >
        {previewing ? '...' : '▶'}
      </button>
    </div>
  )
}
