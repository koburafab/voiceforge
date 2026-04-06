import { useAudioStore, type Provider } from '../stores/audioStore'

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
  { id: 'Rachel', name: 'Rachel (F)' },
  { id: 'Drew', name: 'Drew (M)' },
  { id: 'Clyde', name: 'Clyde (M)' },
  { id: 'Paul', name: 'Paul (M)' },
  { id: 'Domi', name: 'Domi (F)' },
  { id: 'Dave', name: 'Dave (M)' },
  { id: 'Fin', name: 'Fin (M)' },
  { id: 'Sarah', name: 'Sarah (F)' },
  { id: 'Antoni', name: 'Antoni (M)' },
  { id: 'Elli', name: 'Elli (F)' },
]

export function VoiceSelector() {
  const voice = useAudioStore((s) => s.voice)
  const setVoice = useAudioStore((s) => s.setVoice)
  const provider = useAudioStore((s) => s.provider)
  const setProvider = useAudioStore((s) => s.setProvider)

  const voices = provider === 'openai' ? OPENAI_VOICES : ELEVENLABS_VOICES

  const handleProviderChange = (p: Provider) => {
    setProvider(p)
    const defaultVoice = p === 'openai' ? 'nova' : 'Rachel'
    setVoice(defaultVoice)
  }

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
    </div>
  )
}
