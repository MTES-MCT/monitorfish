import { useContext } from 'react'

import { NavigationContext } from '../../context/NavigationContext'

export function useIsInNavigationMode(): boolean {
  const isInNavigationMode = useContext(NavigationContext)

  return isInNavigationMode
}
