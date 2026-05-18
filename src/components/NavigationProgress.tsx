'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<'idle' | 'loading' | 'complete'>('idle')
  const startedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function start() {
    clearTimeout(timerRef.current)
    startedRef.current = true
    setPhase('loading')
    // Safety: if navigation never resolves (cancelled, error), auto-reset after 10s
    timerRef.current = setTimeout(() => {
      startedRef.current = false
      setPhase('idle')
    }, 10_000)
  }

  useEffect(() => {
    if (!startedRef.current) return
    startedRef.current = false
    setPhase('complete')
    timerRef.current = setTimeout(() => setPhase('idle'), 600)
    return () => clearTimeout(timerRef.current)
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (anchor.target === '_blank') return
      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname === window.location.pathname && url.search === window.location.search) return
      } catch {
        return
      }
      start()
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          background: 'var(--accent-sage)',
          width: phase === 'idle' ? '0%' : phase === 'loading' ? '70%' : '100%',
          opacity: phase === 'idle' ? 0 : phase === 'complete' ? 0 : 1,
          transition: phase === 'loading'
            ? 'width 4s cubic-bezier(0.05, 0.4, 0.4, 1), opacity 0.1s'
            : phase === 'complete'
            ? 'width 0.15s ease, opacity 0.4s ease 0.15s'
            : 'none',
        }}
      />
    </div>
  )
}
