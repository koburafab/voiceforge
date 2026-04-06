import { useCallback, useRef } from 'react'
import { useAudioStore } from '../stores/audioStore'
import { transcribe } from '../api/client'

export function SttPanel() {
  const isRecording = useAudioStore((s) => s.isRecording)
  const setRecording = useAudioStore((s) => s.setRecording)
  const transcript = useAudioStore((s) => s.transcript)
  const setTranscript = useAudioStore((s) => s.setTranscript)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size === 0) return

        try {
          const text = await transcribe(blob)
          setTranscript((prev) => (prev ? `${prev}\n${text}` : text))
        } catch (err) {
          alert(`Erreur STT: ${err instanceof Error ? err.message : err}`)
        }
      }

      recorder.start()
      setRecording(true)
    } catch (err) {
      alert(`Micro non disponible: ${err instanceof Error ? err.message : err}`)
    }
  }, [setRecording, setTranscript])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setRecording(false)
  }, [setRecording])

  const handleCopy = useCallback(() => {
    if (transcript) navigator.clipboard.writeText(transcript)
  }, [transcript])

  const handleClear = useCallback(() => {
    setTranscript('')
  }, [setTranscript])

  return (
    <div className="panel stt-panel">
      <div className="stt-controls">
        {isRecording ? (
          <button className="btn btn--recording" onClick={stopRecording}>
            <span className="recording-dot" /> Stop
          </button>
        ) : (
          <button className="btn btn--record" onClick={startRecording}>
            Enregistrer
          </button>
        )}
      </div>

      <textarea
        className="stt-transcript"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Le texte transcrit apparaitra ici..."
        rows={12}
      />

      <div className="stt-buttons">
        <button className="btn" onClick={handleCopy} disabled={!transcript}>
          Copier
        </button>
        <button className="btn" onClick={handleClear} disabled={!transcript}>
          Effacer
        </button>
      </div>
    </div>
  )
}
