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
        className="flex-1 rounded-xl border border-amber-300 bg-white dark:bg-gray-900 dark:border-gray-600 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <button
        type="button"
        onClick={startVoice}
        aria-label={listening ? 'Listening...' : 'Voice search'}
        className={`rounded-xl px-4 py-3 border text-xl transition-colors ${
          listening
            ? 'bg-red-100 border-red-400 text-red-600 animate-pulse'
            : 'bg-white dark:bg-gray-900 border-amber-300 dark:border-gray-600 hover:bg-amber-50'
        }`}
      >
        🎤
      </button>
      <button
        type="submit"
        className="rounded-xl px-4 py-3 bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
      >
        खोज
      </button>
    </form>
  )
}
