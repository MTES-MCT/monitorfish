import { useEffect, useState } from 'react'

export const useClickOutsideComponent  = ref => {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    function handleClickOutside (event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setClicked(true)
      } else {
        setClicked(false)
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
