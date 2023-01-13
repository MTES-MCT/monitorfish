import { useContext } from 'react'

import { NewWindowContext } from './NewWindowContext'

import type { NewWindowContextValue } from './types'

export function useNewWindow(): NewWindowContextValue {
  const contextValue = useContext(NewWindowContext)

  return contextValue
}
