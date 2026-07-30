import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import './Toast.css'

type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nodeRefs = useRef(new Map<number, HTMLDivElement>())

  const dismiss = useCallback((id: number) => {
    const node = nodeRefs.current.get(id)
    if (!node) {
      setToasts((t) => t.filter((toast) => toast.id !== id))
      return
    }
    gsap.to(node, {
      opacity: 0,
      x: 40,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => setToasts((t) => t.filter((toast) => toast.id !== id)),
    })
  }, [])

  const showToast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = nextId++
      setToasts((t) => [...t, { id, message, kind }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            ref={(node) => {
              if (node) {
                nodeRefs.current.set(toast.id, node)
                gsap.fromTo(node, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' })
              } else {
                nodeRefs.current.delete(toast.id)
              }
            }}
            className={`toast toast-${toast.kind}`}
            onClick={() => dismiss(toast.id)}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
