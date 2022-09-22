import { useEffect } from 'react'

export const useEscapeFromKeyboardAndExecute = (callback?: () => void) => {
  const escapeFromKeyboard = event => {
    if (event.key === 'Escape' && callback) {
      callback()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', escapeFromKeyboard, false)

    return () => {
      document.removeEventListener('keydown', escapeFromKeyboard, false)
    }
  }, [callback, escapeFromKeyboard])
}
