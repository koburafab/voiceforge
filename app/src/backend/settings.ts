import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'

export interface Settings {
  openaiKey: string
  elevenLabsKey: string
  defaultVoice: string
  defaultProvider: 'openai' | 'elevenlabs'
  speed: number
}

const DEFAULTS: Settings = {
  openaiKey: '',
  elevenLabsKey: '',
  defaultVoice: 'nova',
  defaultProvider: 'openai',
  speed: 1,
}

function getPath(): string {
  return path.join(os.homedir(), '.config', 'voiceforge', 'settings.json')
}

export function loadSettings(): Settings {
  try {
    const raw = fs.readFileSync(getPath(), 'utf-8')
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(partial: Partial<Settings>): void {
  const filePath = getPath()
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const current = loadSettings()
  const merged = { ...current, ...partial }
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8')
}
