import { Hono } from 'hono'
import { loadSettings } from '../settings'

export function createSttRoutes(): Hono {
  const app = new Hono()

  app.post('/stt', async (c) => {
    const settings = loadSettings()
    const apiKey = settings.openaiKey
    if (!apiKey) return c.json({ error: 'OpenAI API key not configured' }, 400)

    const formData = await c.req.formData()
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'audio file is required' }, 400)
    }

    // Forward to OpenAI Whisper
    const openaiForm = new FormData()
    openaiForm.append('file', file, file.name || 'recording.webm')
    openaiForm.append('model', 'whisper-1')
    openaiForm.append('response_format', 'json')

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openaiForm,
    })

    if (!res.ok) {
      const err = await res.text()
      return c.json({ error: `Whisper error: ${err}` }, res.status)
    }

    const data = await res.json() as { text: string }
    return c.json({ text: data.text })
  })

  return app
}
