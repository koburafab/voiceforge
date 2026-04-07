import { useEffect } from 'react'
import { useAudioStore } from '../stores/audioStore'

export function HistoryPanel() {
  const history = useAudioStore((s) => s.history)
  const setHistory = useAudioStore((s) => s.setHistory)
  const setTtsText = useAudioStore((s) => s.setTtsText)
  const setVoice = useAudioStore((s) => s.setVoice)
  const setProvider = useAudioStore((s) => s.setProvider)

  // Load history from backend on mount
  useEffect(() => {
    fetch('http://localhost:3002/api/history')
      .then((r) => r.json())
      .then((data) => {
        if (data.entries) setHistory(data.entries)
      })
      .catch(() => {})
  }, [setHistory])

  const handleSelect = (entry: typeof history[0]) => {
    setTtsText(entry.text)
    setVoice(entry.voice)
    setProvider(entry.provider)
  }

  const handleClear = () => {
    fetch('http://localhost:3002/api/history', { method: 'DELETE' }).catch(() => {})
    setHistory([])
  }

  if (history.length === 0) return null

  return (
    <aside className="history-panel">
      <div className="history-header">
        <h3>Historique</h3>
        <button className="btn btn--small" onClick={handleClear}>Vider</button>
      </div>
      <div className="history-list">
        {history.map((entry) => (
          <button
            key={entry.id}
            className="history-item"
            onClick={() => handleSelect(entry)}
            title={entry.text}
          >
            <span className="history-item__text">{entry.text.slice(0, 60)}{entry.text.length > 60 ? '...' : ''}</span>
            <span className="history-item__meta">
              {entry.voice} · {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
