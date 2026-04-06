'use client'
import { useEffect, useState } from 'react'

export default function WakeLockButton() {
  const [active, setActive] = useState(false)
  const [lock, setLock] = useState<WakeLockSentinel | null>(null)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported('wakeLock' in navigator)
  }, [])

  async function toggle() {
    if (active && lock) {
      await lock.release()
      setLock(null)
      setActive(false)
    } else {
      try {
        const sentinel = await navigator.wakeLock.request('screen')
        setLock(sentinel)
        setActive(true)
        sentinel.addEventListener('release', () => setActive(false))
      } catch (err) {
        console.warn('Wake Lock request failed:', err)
      }
    }
  }

  useEffect(() => () => { lock?.release() }, [lock])

  if (!supported) return null

  return (
    <button
      onClick={toggle}
      title={active ? 'Screen will stay on' : 'Keep screen on while reading'}
      className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
        active
          ? 'bg-[#D4EBE4] border-[#4A7A6A] text-[#2A5A4E] dark:bg-[#1B3055] dark:border-[#4A7A6A] dark:text-[#7AB0A0]'
          : 'border-[#D4C4A0] dark:border-[#1B3055] text-[#7A6550] hover:bg-[#EDE4D2] dark:hover:bg-[#1B3055]'
      }`}
    >
      {active ? '🌞 On' : '💤 Sleep'}
    </button>
  )
}
