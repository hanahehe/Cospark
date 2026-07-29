import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Staggered fade+rise entrance for any element carrying the `.reveal` class
 * inside the returned ref. Attach the ref to a page's outer container.
 *
 * Deliberately avoids gsap.context()/revert() for cleanup: under React 19
 * StrictMode's dev-only double-invoke of effects, revert() can race with the
 * first tween and leave targets stuck at their "from" state (opacity: 0)
 * instead of ever reaching "to". killTweensOf + a fresh fromTo on every
 * effect run is simpler and converges correctly regardless of how many times
 * the effect fires.
 */
export function usePageEntrance<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T | null>(null)

  useLayoutEffect(() => {
    if (!ref.current) return
    const targets = ref.current.querySelectorAll('.reveal')
    if (!targets.length) return

    gsap.killTweensOf(targets)
    gsap.fromTo(
      targets,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', overwrite: true },
    )

    return () => {
      gsap.killTweensOf(targets)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
