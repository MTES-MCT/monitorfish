import { useContext } from 'react'

import { LightContext } from '../../context/LightContext'

export function useIsInLightMode(): boolean {
  const isInLightMode = useContext(LightContext)

  return isInLightMode
}
