'use client'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any

interface Props {
  defaultValue?: string
  placeholder?: string
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'भजन खोजें... (Hindi या Hinglish)',
}: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<AnySpeechRecognition>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function startVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition

    if (!SR) {
      alert('Voice search is not supported in this browser. Try Chrome.')
      return
    }

    const recognition = new SR()
    recognition.lang = 'hi-IN'
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      router.push(`/search?q=${encodeURIComponent(transcript)}`)
    }

    recognition.start()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-[#D4C4A0] bg-[#FDFAF5] dark:bg-[#0F2040] dark:border-[#1B3055] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#1B4E7A] dark:focus:ring-[#2E6FA8]"
      />
      <button
        type="button"
        onClick={startVoice}
        aria-label={listening ? 'Listening...' : 'Voice search'}
        className={`rounded-xl px-4 py-3 border text-xl transition-colors ${
          listening
            ? 'bg-[#C4962A] border-[#C4962A] text-white animate-pulse'
            : 'bg-[#FDFAF5] dark:bg-[#0F2040] border-[#D4C4A0] dark:border-[#1B3055] hover:bg-[#EDE4D2]'
        }`}
      >
        🎤
      </button>
      <button
        type="submit"
        className="rounded-xl px-4 py-3 bg-[#1B4E7A] hover:bg-[#2E6FA8] text-white font-medium transition-colors"
      >
        खोज
      </button>
    </form>
  )
}
