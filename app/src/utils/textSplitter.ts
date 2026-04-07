const MAX_CHUNK = 4000

export function splitText(text: string): string[] {
  if (text.length <= MAX_CHUNK) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > 0) {
    if (remaining.length <= MAX_CHUNK) {
      chunks.push(remaining)
      break
    }

    // Find last sentence end before MAX_CHUNK
    let splitAt = -1
    for (let i = MAX_CHUNK; i > MAX_CHUNK / 2; i--) {
      if ('.!?\n'.includes(remaining[i])) {
        splitAt = i + 1
        break
      }
    }

    // Fallback: split at last space
    if (splitAt === -1) {
      for (let i = MAX_CHUNK; i > MAX_CHUNK / 2; i--) {
        if (remaining[i] === ' ') {
          splitAt = i + 1
          break
        }
      }
    }

    // Last resort: hard split
    if (splitAt === -1) splitAt = MAX_CHUNK

    chunks.push(remaining.slice(0, splitAt).trim())
    remaining = remaining.slice(splitAt).trim()
  }

  return chunks
}

export function estimateCost(text: string, provider: string): string {
  const chars = text.length
  if (chars === 0) return ''

  // OpenAI TTS-HD: $0.030 / 1000 chars
  // ElevenLabs: ~$0.30 / 1000 chars
  const rate = provider === 'elevenlabs' ? 0.30 : 0.030
  const cost = (chars / 1000) * rate

  if (cost < 0.01) return '< $0.01'
  return `~$${cost.toFixed(2)}`
}
