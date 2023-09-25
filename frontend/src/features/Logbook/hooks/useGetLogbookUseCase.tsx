import { useMemo } from 'react'

import { useIsInNavigationMode } from '../../../hooks/authorization/useIsInNavigationMode'
import { getVesselLogbook } from '../useCases/getVesselLogbook'

export function useGetLogbookUseCase() {
  const isInNavigationMode = useIsInNavigationMode()

  return useMemo(() => getVesselLogbook(isInNavigationMode), [isInNavigationMode])
}
