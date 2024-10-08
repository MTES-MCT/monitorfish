import { useIsInLightMode } from '@hooks/useIsInLightMode'
import { useMemo } from 'react'

import { useGetVesselsLastPositionsQuery } from '../vesselApi'
import { useGetVesselsLastPositionsNavQuery } from '../vesselNavApi'

export function useGetVesselsLastPositionsApi() {
  const isInLightMode = useIsInLightMode()

  return useMemo(() => {
    if (isInLightMode) {
      return useGetVesselsLastPositionsNavQuery
    }

    return useGetVesselsLastPositionsQuery
  }, [isInLightMode])
}
