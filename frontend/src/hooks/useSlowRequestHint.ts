import { useEffect, useState } from 'react'

/**
 * Becomes true once a pending action has been running longer than `afterMs`.
 *
 * The backend sits on a free tier that sleeps after inactivity and can take up to a minute
 * to wake, so a slow submit is expected rather than broken. This lets the UI say so
 * instead of leaving someone staring at a button that looks stuck.
 */
export function useSlowRequestHint(isPending: boolean, afterMs = 4000): boolean {
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    if (!isPending) {
      setIsSlow(false)
      return
    }
    const timer = setTimeout(() => setIsSlow(true), afterMs)
    return () => clearTimeout(timer)
  }, [isPending, afterMs])

  return isSlow
}
