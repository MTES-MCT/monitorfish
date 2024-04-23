import { useEffect, useState, type MutableRefObject } from 'react'

export const useClickOutsideWhenOpenedWithinRef = (
  ref: MutableRefObject<HTMLDivElement | null>,
  isOpened: boolean,
  // TODO Should be `MutableRefObject<HTMLDivElement | null> | undefined`.
  baseRef: MutableRefObject<HTMLDivElement | undefined> | undefined
): {} | null => {
  const [clicked, setClicked] = useState<{} | null>(null)

  useEffect(
    () => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setClicked({})
        } else {
          setClicked(null)
        }
      }

      // Bind the event listener
      if (isOpened) {
        if (baseRef) {
          baseRef.current?.addEventListener('mousedown', handleClickOutside)
        } else {
          document.addEventListener('mousedown', handleClickOutside)
        }
      }

      return () => {
        // Unbind the event listener on clean up
        if (baseRef) {
          // TODO Not so sure about this disabled ESLint rule, quick workaround for TS migration.
          // eslint-disable-next-line react-hooks/exhaustive-deps
          baseRef.current?.removeEventListener('mousedown', handleClickOutside)
        } else {
          document.addEventListener('mousedown', handleClickOutside)
        }
      }
    },

    // TODO Not so sure about this disabled ESLint rule, quick workaround for TS migration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref, isOpened]
  )

  return clicked
}
