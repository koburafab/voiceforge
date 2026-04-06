import { useEffect, useState } from 'react'
import { useAudioStore } from '../stores/audioStore'
import { getSettings, saveSettings } from '../api/client'

export function SettingsModal() {
  const showSettings = useAudioStore((s) => s.showSettings)
  const setShowSettings = useAudioStore((s) => s.setShowSettings)

  const [openaiKey, setOpenaiKey] = useState('')
  const [elevenLabsKey, setElevenLabsKey] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (showSettings) {
      getSettings().then((s) => {
        setOpenaiKey(s.openaiKey || '')
        setElevenLabsKey(s.elevenLabsKey || '')
      }).catch(() => {})
    }
  }, [showSettings])

  if (!showSettings) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSettings({ openaiKey, elevenLabsKey })
      setShowSettings(false)
    } catch (err) {
      alert(`Erreur: ${err instanceof Error ? err.message : err}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={() => setShowSettings(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Settings</h2>

        <label>
          OpenAI API Key
          <input
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
          />
        </label>

        <label>
          ElevenLabs API Key
          <input
            type="password"
            value={elevenLabsKey}
            onChange={(e) => setElevenLabsKey(e.target.value)}
            placeholder="xi-..."
          />
        </label>

        <div className="modal-buttons">
          <button className="btn" onClick={() => setShowSettings(false)}>Annuler</button>
          <button className="btn btn--play" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
