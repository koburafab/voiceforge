import { useState, useEffect } from 'react'
import { TtsPanel } from './components/TtsPanel'
import { SttPanel } from './components/SttPanel'
import { SettingsModal } from './components/SettingsModal'
import { useAudioStore } from './stores/audioStore'
import { waitForBackend } from './api/client'
import './App.css'

type Tab = 'tts' | 'stt'

function App() {
  const [tab, setTab] = useState<Tab>('tts')
  const [ready, setReady] = useState(false)
  const setShowSettings = useAudioStore((s) => s.setShowSettings)

  useEffect(() => {
    waitForBackend().then(setReady)
  }, [])

  if (!ready) {
    return (
      <div className="app">
        <div className="loading">Demarrage du backend...</div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">VoiceForge</h1>
        <nav className="header__tabs">
          <button
            className={`tab ${tab === 'tts' ? 'tab--active' : ''}`}
            onClick={() => setTab('tts')}
          >
            Parler
          </button>
          <button
            className={`tab ${tab === 'stt' ? 'tab--active' : ''}`}
            onClick={() => setTab('stt')}
          >
            Dicter
          </button>
        </nav>
        <button
          className="header__settings"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          ⚙
        </button>
      </header>

      <main className="main">
        {tab === 'tts' ? <TtsPanel /> : <SttPanel />}
      </main>

      <SettingsModal />
    </div>
  )
}

export default App
