import { useEffect } from 'react'

export const useEscapeFromKeyboardAndExecute = (callback?: () => void) => {
  useEffect(() => {
    document.addEventListener('keydown', escapeFromKeyboard, false)

    return () => {
      document.removeEventListener('keydown', escapeFromKeyboard, false)
    }
  }, [])

  const escapeFromKeyboard = event => {
    if (event.key === 'Escape' && callback) {
      callback()
    }
  }
}
