import { useMemo } from 'react'

import { useIsInNavigationMode } from '../../../hooks/authorization/useIsInNavigationMode'
import { useGetVesselsLastPositionsNavQuery, useGetVesselsLastPositionsQuery } from '../apis'

export function useGetVesselsLastPositionsApi() {
  const isInNavigationMode = useIsInNavigationMode()

  return useMemo(() => {
    if (isInNavigationMode) {
      return useGetVesselsLastPositionsNavQuery
    }

    return useGetVesselsLastPositionsQuery
  }, [isInNavigationMode])
}
