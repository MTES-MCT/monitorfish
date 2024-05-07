import { useIsInLightMode } from '@hooks/useIsInLightMode'
import { useMemo } from 'react'

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
