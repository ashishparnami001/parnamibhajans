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
          ? 'bg-[#D5F0EE] border-[#1F8A87] text-[#12605E] dark:bg-[#1D4068] dark:border-[#1F8A87] dark:text-[#5BC0BC]'
          : 'border-[#DACAAE] dark:border-[#1D4068] text-[#7A6550] hover:bg-[#EDE3CD] dark:hover:bg-[#1D4068]'
      }`}
    >
      {active ? '🌞 On' : '💤 Sleep'}
    </button>
  )
}
