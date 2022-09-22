import { useEffect } from 'react'

export const useClickOutsideWhenOpenedAndExecute = (ref, isOpen, callback: () => void) => {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target) && isOpen && callback) {
        callback()
      }
    }

    // Bind the event listener
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, isOpen, callback])
}
