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
          ? 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400'
          : 'border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {active ? '🌞 On' : '💤 Sleep'}
    </button>
  )
}
