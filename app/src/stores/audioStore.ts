import { create } from 'zustand'

export type Provider = 'openai' | 'elevenlabs'

export interface AudioState {
  // TTS
  ttsText: string
  voice: string
  provider: Provider
  speed: number
  isPlaying: boolean
  isGenerating: boolean
  audioUrl: string | null

  // STT
  isRecording: boolean
  transcript: string

  // Settings
  showSettings: boolean

  // Actions
  setTtsText: (text: string) => void
  setVoice: (voice: string) => void
  setProvider: (provider: Provider) => void
  setSpeed: (speed: number) => void
  setPlaying: (playing: boolean) => void
  setGenerating: (generating: boolean) => void
  setAudioUrl: (url: string | null) => void
  setRecording: (recording: boolean) => void
  setTranscript: (text: string) => void
  setShowSettings: (show: boolean) => void
}

export const useAudioStore = create<AudioState>((set) => ({
  ttsText: '',
  voice: 'nova',
  provider: 'openai',
  speed: 1,
  isPlaying: false,
  isGenerating: false,
  audioUrl: null,

  isRecording: false,
  transcript: '',

  showSettings: false,

  setTtsText: (text) => set({ ttsText: text }),
  setVoice: (voice) => set({ voice }),
  setProvider: (provider) => set({ provider }),
  setSpeed: (speed) => set({ speed }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setAudioUrl: (url) => set({ audioUrl: url }),
  setRecording: (recording) => set({ isRecording: recording }),
  setTranscript: (text) => set({ transcript: text }),
  setShowSettings: (show) => set({ showSettings: show }),
}))
