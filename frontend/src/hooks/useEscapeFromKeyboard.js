import { useEffect, useState } from 'react'

export const useEscapeFromKeyboard = () => {
  const [escape, setEscape] = useState(null)

  useEffect(() => {
    document.addEventListener('keydown', escapeFromKeyboard, false)
  }, [])

  const escapeFromKeyboard = event => {
    if (event.key === 'Escape') {
      setEscape({ dummyTrigger: true })
    }

    document.removeEventListener('keydown', escapeFromKeyboard, false)
  }

  return escape
}
