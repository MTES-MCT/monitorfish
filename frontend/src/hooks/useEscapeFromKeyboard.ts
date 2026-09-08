import { useEffect, useState } from 'react'

export const useEscapeFromKeyboard = () => {
  const [escape, setEscape] = useState<{
    dummyTrigger: true
  } | null>(null)

  useEffect(() => {
    const escapeFromKeyboard = event => {
      if (event.key === 'Escape') {
        setEscape({ dummyTrigger: true })
      }
    }

    document.addEventListener('keydown', escapeFromKeyboard, false)

    return () => {
      document.removeEventListener('keydown', escapeFromKeyboard, false)
    }
  }, [])

  return escape
}
