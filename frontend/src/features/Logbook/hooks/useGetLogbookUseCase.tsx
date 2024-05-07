import { useIsInLightMode } from '@hooks/useIsInLightMode'
import { useMemo } from 'react'

import { getVesselLogbook } from '../useCases/getVesselLogbook'

export function useGetLogbookUseCase() {
  const isInLightMode = useIsInLightMode()

  return useMemo(() => getVesselLogbook(isInLightMode), [isInLightMode])
}
