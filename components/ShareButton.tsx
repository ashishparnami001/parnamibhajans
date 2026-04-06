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
      className="text-xs px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {copied ? '✓ Copied' : '📤 Share'}
    </button>
  )
}
