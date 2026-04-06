'use client'
import { useEffect, useState } from 'react'

const SIZES = [16, 18, 20, 22, 24, 28, 32]
const DEFAULT_IDX = 2 // 20px
const STORAGE_KEY = 'bhajan-font-size'

export default function FontSizeControl() {
  const [idx, setIdx] = useState(DEFAULT_IDX)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const savedIdx = SIZES.indexOf(Number(saved))
    if (savedIdx >= 0) setIdx(savedIdx)
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-bhajan', `${SIZES[idx]}px`)
    localStorage.setItem(STORAGE_KEY, String(SIZES[idx]))
  }, [idx])

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIdx(i => Math.max(0, i - 1))}
        disabled={idx === 0}
        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
        aria-label="Decrease font size"
      >A−</button>
      <span className="text-xs text-gray-400 w-10 text-center">{SIZES[idx]}px</span>
      <button
        onClick={() => setIdx(i => Math.min(SIZES.length - 1, i + 1))}
        disabled={idx === SIZES.length - 1}
        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
        aria-label="Increase font size"
      >A+</button>
    </div>
  )
}
