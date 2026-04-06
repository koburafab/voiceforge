import { Hono } from 'hono'
import { loadSettings } from '../settings'

export function createTtsRoutes(): Hono {
  const app = new Hono()

  app.post('/tts', async (c) => {
    const body = await c.req.json<{
      text: string
      voice?: string
      provider?: string
      speed?: number
    }>()

    if (!body.text) return c.json({ error: 'text is required' }, 400)

    const settings = loadSettings()
    const provider = body.provider || settings.defaultProvider
    const voice = body.voice || settings.defaultVoice
    const speed = body.speed || settings.speed

    if (provider === 'elevenlabs') {
      return handleElevenLabs(c, body.text, voice, settings.elevenLabsKey)
    }

    // OpenAI TTS
    const apiKey = settings.openaiKey
    if (!apiKey) return c.json({ error: 'OpenAI API key not configured' }, 400)

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: body.text,
        voice,
        speed,
        response_format: 'mp3',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return c.json({ error: `OpenAI TTS error: ${err}` }, res.status)
    }

    const audioBuffer = await res.arrayBuffer()
    return new Response(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  })

  return app
}

async function handleElevenLabs(c: any, text: string, voice: string, apiKey: string) {
  if (!apiKey) return c.json({ error: 'ElevenLabs API key not configured' }, 400)

  // First, resolve voice name to voice_id
  const voiceId = await resolveElevenLabsVoice(voice, apiKey)

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return c.json({ error: `ElevenLabs error: ${err}` }, res.status)
  }

  const audioBuffer = await res.arrayBuffer()
  return new Response(audioBuffer, {
    headers: { 'Content-Type': 'audio/mpeg' },
  })
}

// Cache voice list
let voiceCache: Record<string, string> = {}

async function resolveElevenLabsVoice(name: string, apiKey: string): Promise<string> {
  // If it looks like a voice_id already, return it
  if (name.length > 15 && !name.includes(' ')) return name

  if (voiceCache[name]) return voiceCache[name]

  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey },
  })

  if (res.ok) {
    const data = await res.json() as { voices: Array<{ voice_id: string; name: string }> }
    for (const v of data.voices) {
      voiceCache[v.name] = v.voice_id
    }
  }

  return voiceCache[name] || name
}
