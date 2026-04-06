'use client'

interface Props { title: string }

export default function ShareButton({ title }: Props) {
  async function share() {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <button
      onClick={share}
      className="text-xs px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      📤 Share
    </button>
  )
}
