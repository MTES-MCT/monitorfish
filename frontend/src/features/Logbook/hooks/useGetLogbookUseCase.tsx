import { useMemo } from 'react'

import { useIsInLightMode } from '../../../hooks/authorization/useIsInLightMode'
import { getVesselLogbook } from '../useCases/getVesselLogbook'

export function useGetLogbookUseCase() {
  const isInLightMode = useIsInLightMode()

  return useMemo(() => getVesselLogbook(isInLightMode), [isInLightMode])
}
