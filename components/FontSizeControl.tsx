'use client'
import { useEffect, useState } from 'react'

const SIZES = [16, 18, 20, 22, 24, 28, 32]
const DEFAULT_IDX = 2 // 20px
const STORAGE_KEY = 'bhajan-font-size'

export default function FontSizeControl() {
  const [idx, setIdx] = useState<number | null>(null)

  // Read saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const savedIdx = SIZES.indexOf(Number(saved))
    setIdx(savedIdx >= 0 ? savedIdx : DEFAULT_IDX)
  }, [])

  // Write CSS variable and localStorage whenever idx changes (skip until loaded)
  useEffect(() => {
    if (idx === null) return
    document.documentElement.style.setProperty('--font-size-bhajan', `${SIZES[idx]}px`)
    localStorage.setItem(STORAGE_KEY, String(SIZES[idx]))
  }, [idx])

  const currentIdx = idx ?? DEFAULT_IDX

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIdx(i => Math.max(0, (i ?? DEFAULT_IDX) - 1))}
        disabled={currentIdx === 0}
        className="w-8 h-8 rounded-full border border-[#D4C4A0] dark:border-[#1B3055] flex items-center justify-center text-xs hover:bg-[#EDE4D2] dark:hover:bg-[#1B3055] disabled:opacity-30"
        aria-label="Decrease font size"
      >A−</button>
      <span className="text-xs text-[#7A6550] w-10 text-center">{SIZES[currentIdx]}px</span>
      <button
        onClick={() => setIdx(i => Math.min(SIZES.length - 1, (i ?? DEFAULT_IDX) + 1))}
        disabled={currentIdx === SIZES.length - 1}
        className="w-8 h-8 rounded-full border border-[#D4C4A0] dark:border-[#1B3055] flex items-center justify-center text-xs hover:bg-[#EDE4D2] dark:hover:bg-[#1B3055] disabled:opacity-30"
        aria-label="Increase font size"
      >A+</button>
    </div>
  )
}
