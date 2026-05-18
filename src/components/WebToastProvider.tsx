'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle } from 'lucide-react'

const ToastContext = createContext<{
  showToast: (message: string) => void
} | null>(null)

export function WebToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showToast = useCallback((msg: string) => {
    clearTimeout(timerRef.current)
    setMessage(msg)
    setVisible(true)
    timerRef.current = setTimeout(() => setVisible(false), 2500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          // Sits above the TabBar (54px) + iOS safe-area + 12px breathing room
          bottom: 'calc(54px + env(safe-area-inset-bottom, 0px) + 12px)',
          left: '50%',
          transform: `translateX(-50%) translateY(${visible ? '0' : '12px'})`,
          zIndex: 9998,
          opacity: visible ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            borderRadius: 24,
            background: '#2D2D2D',
            color: '#FFFFFF',
            fontFamily: 'var(--font-jakarta)',
            fontSize: 13,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          }}
        >
          <CheckCircle size={15} strokeWidth={2.5} color="#7C9070" />
          {message}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useWebToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useWebToast must be used within WebToastProvider')
  return ctx
}
