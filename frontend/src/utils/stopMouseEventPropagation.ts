import type { MouseEvent } from 'react'

export function stopMouseEventPropagation(event: MouseEvent<HTMLElement>) {
  event.stopPropagation()
}
