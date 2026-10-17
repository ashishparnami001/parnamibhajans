'use client'
import { useRouter } from 'next/navigation'
import { useId, useMemo, useRef, useState } from 'react'
import { suggest, SuggestItem } from '@/lib/suggest'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any

interface Props {
  defaultValue?: string
  placeholder?: string
  suggestions?: SuggestItem[]
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'भजन खोजें... (Hindi या English)',
  suggestions = [],
}: Props) {
  const router = useRouter()
  const listId = useId()
  const [query, setQuery] = useState(defaultValue)
  const [listening, setListening] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const recognitionRef = useRef<AnySpeechRecognition>(null)

  const matches = useMemo(
    () => (open ? suggest(query, suggestions) : []),
    [open, query, suggestions]
  )
  const showList = matches.length > 0

  function goToSearch(text: string) {
    const trimmed = text.trim()
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  function goToBhajan(item: SuggestItem) {
    setOpen(false)
    router.push(`/bhajans/${item.id}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setOpen(false)
    goToSearch(query)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    } else if (e.key === 'ArrowDown' && showList) {
      e.preventDefault()
      setActive(i => (i + 1) % matches.length)
    } else if (e.key === 'ArrowUp' && showList) {
      e.preventDefault()
      setActive(i => (i <= 0 ? matches.length - 1 : i - 1))
    } else if (e.key === 'Enter' && showList && active >= 0) {
      e.preventDefault()
      goToBhajan(matches[active])
    }
  }

  function startVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition

    if (!SR) {
      alert('Voice search is not supported in this browser. Try Chrome or Safari.')
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
      setOpen(false)
      goToSearch(transcript)
    }

    recognition.start()
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex gap-2 w-full">
      <div className="relative flex-1">
        <input
          type="search"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          className="w-full rounded-xl border border-[#D4C4A0] bg-[#FDFAF5] dark:bg-[#0F2040] dark:border-[#1B3055] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#1B4E7A] dark:focus:ring-[#2E6FA8]"
        />
        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 left-0 right-0 mt-1 overflow-hidden rounded-xl border border-[#D4C4A0] bg-[#FDFAF5] dark:bg-[#0F2040] dark:border-[#1B3055] shadow-lg"
          >
            {matches.map((item, index) => (
              <li
                key={item.id}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                // mousedown fires before the input loses focus, so the click is not lost
                onMouseDown={e => {
                  e.preventDefault()
                  goToBhajan(item)
                }}
                onMouseEnter={() => setActive(index)}
                className={`cursor-pointer px-4 py-2 ${
                  index === active ? 'bg-[#EDE4D2] dark:bg-[#1B3055]' : ''
                }`}
              >
                <div className="truncate text-base">{item.title}</div>
                {item.author && (
                  <div className="truncate text-xs text-[#7A6550] dark:text-[#8A9AAA]">
                    {item.author}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
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
