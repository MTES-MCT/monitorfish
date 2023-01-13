import { createContext } from 'react'

import type { NewWindowContextValue } from './types'

export const NewWindowContext = createContext<NewWindowContextValue>({
  newWindowContainerRef: {
    current: window.document.createElement('div')
  }
})
