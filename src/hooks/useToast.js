import { useState, useRef, useCallback } from 'react'

export function useToast() {
  const [message, setMessage] = useState('')
  const timer = useRef(null)

  const toast = useCallback((msg) => {
    setMessage(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(''), 2400)
  }, [])

  return { message, toast }
}
