'use client'
import { useState } from 'react'

interface Props { title: string }

export default function ShareButton({ title }: Props) {
  const [copied, setCopied] = useState(false)

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href })
      } catch {
        // User cancelled share — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Clipboard not available
      }
    }
  }

  return (
    <button
      onClick={share}
      className="text-xs px-2 py-1 rounded-lg border border-[#D4C4A0] dark:border-[#1B3055] text-[#7A6550] hover:bg-[#EDE4D2] dark:hover:bg-[#1B3055] transition-colors"
    >
      {copied ? '✓ Copied' : '📤 Share'}
    </button>
  )
}
