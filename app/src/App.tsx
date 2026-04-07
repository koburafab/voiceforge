import { useState, useEffect, useCallback } from 'react'
import { TtsPanel } from './components/TtsPanel'
import { SttPanel } from './components/SttPanel'
import { HistoryPanel } from './components/HistoryPanel'
import { SettingsModal } from './components/SettingsModal'
import { useAudioStore } from './stores/audioStore'
import { waitForBackend, getSettings } from './api/client'
import type { ThemeMode } from './stores/audioStore'
import './App.css'

type Tab = 'tts' | 'stt'

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  if (theme !== 'system') root.classList.add(theme)
}

function App() {
  const [tab, setTab] = useState<Tab>('tts')
  const [ready, setReady] = useState(false)
  const setShowSettings = useAudioStore((s) => s.setShowSettings)
  const theme = useAudioStore((s) => s.theme)
  const setTheme = useAudioStore((s) => s.setTheme)

  // Load theme from settings on mount
  useEffect(() => {
    waitForBackend().then(async (ok) => {
      setReady(ok)
      if (ok) {
        try {
          const s = await getSettings()
          if (s.theme) setTheme(s.theme as ThemeMode)
        } catch { /* ignore */ }
      }
    })
  }, [setTheme])

  // Apply theme to DOM
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Toggle theme
  const cycleTheme = useCallback(() => {
    const next: ThemeMode = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system'
    setTheme(next)
    // Persist
    fetch('http://localhost:3002/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {})
  }, [theme, setTheme])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const inInput = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT'

      // Escape = stop (always)
      if (e.key === 'Escape') {
        const audio = document.querySelector('audio') as HTMLAudioElement | null
        if (audio) { audio.pause(); audio.currentTime = 0 }
        return
      }

      // Ctrl+Shift+R = record toggle
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault()
        setTab('stt')
        // Trigger via custom event
        window.dispatchEvent(new CustomEvent('voiceforge:toggle-record'))
        return
      }

      // Ctrl+Shift+C = copy transcript
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        const transcript = useAudioStore.getState().transcript
        if (transcript) navigator.clipboard.writeText(transcript)
        return
      }

      // Ctrl+Enter = play (even in textarea)
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('voiceforge:play'))
        return
      }

      // Space = pause/resume (only when not in input)
      if (e.key === ' ' && !inInput) {
        e.preventDefault()
        const audio = document.querySelector('audio') as HTMLAudioElement | null
        if (audio) {
          audio.paused ? audio.play() : audio.pause()
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!ready) {
    return (
      <div className="app">
        <div className="loading">Demarrage du backend...</div>
      </div>
    )
  }

  const themeIcon = theme === 'dark' ? '☀' : theme === 'light' ? '🌙' : '◐'

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">VoiceForge</h1>
        <nav className="header__tabs">
          <button className={`tab ${tab === 'tts' ? 'tab--active' : ''}`} onClick={() => setTab('tts')}>
            Parler
          </button>
          <button className={`tab ${tab === 'stt' ? 'tab--active' : ''}`} onClick={() => setTab('stt')}>
            Dicter
          </button>
        </nav>
        <div className="header__actions">
          <button className="header__theme-btn" onClick={cycleTheme} title={`Theme: ${theme}`}>
            {themeIcon}
          </button>
          <button className="header__settings" onClick={() => setShowSettings(true)} title="Settings">
            ⚙
          </button>
        </div>
      </header>

      <div className="content">
        <main className="main">
          {tab === 'tts' ? <TtsPanel /> : <SttPanel />}
        </main>
        {tab === 'tts' && <HistoryPanel />}
      </div>

      <footer className="shortcuts-bar">
        <span>Ctrl+Enter: Play</span>
        <span>Espace: Pause</span>
        <span>Escape: Stop</span>
        <span>Ctrl+Shift+R: Record</span>
      </footer>

      <SettingsModal />
    </div>
  )
}

export default App
