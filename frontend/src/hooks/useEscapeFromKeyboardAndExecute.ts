import { useEffect } from 'react'

export const useEscapeFromKeyboardAndExecute = (callback?: () => void) => {
  useEffect(() => {
    const escapeFromKeyboard = event => {
      if (event.key === 'Escape' && callback) {
        callback()
      }
    }

    document.addEventListener('keydown', escapeFromKeyboard, false)

    return () => {
      document.removeEventListener('keydown', escapeFromKeyboard, false)
    }
  }, [callback])
}
