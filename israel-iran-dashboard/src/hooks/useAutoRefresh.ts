import { useEffect, useRef } from 'react'

export function useAutoRefresh(callback: () => void | Promise<void>, delay: number) {
  const savedCallback = useRef<() => void | Promise<void>>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current()
      }
    }
    
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}
