import { create } from 'zustand'

export type Provider = 'openai' | 'elevenlabs'
export type ThemeMode = 'system' | 'dark' | 'light'

export interface HistoryEntry {
  id: string
  text: string
  voice: string
  provider: Provider
  timestamp: number
  audioUrl?: string
}

export interface AudioState {
  // TTS
  ttsText: string
  voice: string
  provider: Provider
  speed: number
  isPlaying: boolean
  isGenerating: boolean
  audioUrl: string | null
  generateProgress: string | null

  // STT
  isRecording: boolean
  transcript: string

  // UI
  showSettings: boolean
  theme: ThemeMode

  // History
  history: HistoryEntry[]

  // Actions
  setTtsText: (text: string) => void
  setVoice: (voice: string) => void
  setProvider: (provider: Provider) => void
  setSpeed: (speed: number) => void
  setPlaying: (playing: boolean) => void
  setGenerating: (generating: boolean) => void
  setAudioUrl: (url: string | null) => void
  setGenerateProgress: (progress: string | null) => void
  setRecording: (recording: boolean) => void
  setTranscript: (text: string) => void
  setShowSettings: (show: boolean) => void
  setTheme: (theme: ThemeMode) => void
  addHistory: (entry: HistoryEntry) => void
  setHistory: (history: HistoryEntry[]) => void
  clearHistory: () => void
}

export const useAudioStore = create<AudioState>((set) => ({
  ttsText: '',
  voice: 'nova',
  provider: 'openai',
  speed: 1,
  isPlaying: false,
  isGenerating: false,
  audioUrl: null,
  generateProgress: null,

  isRecording: false,
  transcript: '',

  showSettings: false,
  theme: 'system',

  history: [],

  setTtsText: (text) => set({ ttsText: text }),
  setVoice: (voice) => set({ voice }),
  setProvider: (provider) => set({ provider }),
  setSpeed: (speed) => set({ speed }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setAudioUrl: (url) => set({ audioUrl: url }),
  setGenerateProgress: (progress) => set({ generateProgress: progress }),
  setRecording: (recording) => set({ isRecording: recording }),
  setTranscript: (text) => set({ transcript: text }),
  setShowSettings: (show) => set({ showSettings: show }),
  setTheme: (theme) => set({ theme }),
  addHistory: (entry) => set((s) => ({
    history: [entry, ...s.history].slice(0, 50),
  })),
  setHistory: (history) => set({ history }),
  clearHistory: () => set({ history: [] }),
}))
