import { useEffect, useState } from 'react'

export const useClickOutside = ref => {
  const [clicked, setClicked] = useState(null)

  useEffect(() => {
    function handleClickOutside (event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setClicked({})
      } else {
        setClicked(null)
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref])

  return clicked
}
