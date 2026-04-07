import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'

interface HistoryEntry {
  id: string
  text: string
  voice: string
  provider: string
  timestamp: number
}

const MAX_ENTRIES = 50

function getPath(): string {
  return path.join(os.homedir(), '.config', 'voiceforge', 'history.json')
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = fs.readFileSync(getPath(), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id'>): void {
  const entries = loadHistory()
  entries.unshift({ ...entry, id: crypto.randomUUID() })
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES

  const filePath = getPath()
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), 'utf-8')
}

export function clearHistory(): void {
  const filePath = getPath()
  if (fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]', 'utf-8')
}
