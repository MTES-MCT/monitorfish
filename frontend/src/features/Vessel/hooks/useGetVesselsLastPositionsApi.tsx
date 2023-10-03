import { useMemo } from 'react'

import { useIsInLightMode } from '../../../hooks/authorization/useIsInLightMode'
import { useGetVesselsLastPositionsNavQuery, useGetVesselsLastPositionsQuery } from '../apis'

export function useGetVesselsLastPositionsApi() {
  const isInLightMode = useIsInLightMode()

  return useMemo(() => {
    if (isInLightMode) {
      return useGetVesselsLastPositionsNavQuery
    }

    return useGetVesselsLastPositionsQuery
  }, [isInLightMode])
}
