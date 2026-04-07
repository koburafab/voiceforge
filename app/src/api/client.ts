const BACKEND = 'http://localhost:3002'

export interface VoiceForgeSettings {
  openaiKey: string
  elevenLabsKey: string
  defaultVoice: string
  defaultProvider: 'openai' | 'elevenlabs'
  speed: number
  theme?: string
}

// --- TTS ---

export async function synthesize(text: string, voice: string, provider: string, speed: number): Promise<ArrayBuffer> {
  const res = await fetch(`${BACKEND}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice, provider, speed }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }
  return res.arrayBuffer()
}

// --- STT ---

export async function transcribe(audioBlob: Blob): Promise<string> {
  const form = new FormData()
  form.append('file', audioBlob, 'recording.webm')

  const res = await fetch(`${BACKEND}/api/stt`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }
  const data = await res.json()
  return data.text
}

// --- Settings ---

export async function getSettings(): Promise<VoiceForgeSettings> {
  const res = await fetch(`${BACKEND}/api/settings`)
  return res.json()
}

export async function saveSettings(settings: Partial<VoiceForgeSettings>): Promise<void> {
  await fetch(`${BACKEND}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
}

export async function waitForBackend(maxRetries = 20, intervalMs = 500): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${BACKEND}/health`)
      if (res.ok) return true
    } catch { /* not ready */ }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  return false
}
