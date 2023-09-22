import { useMemo } from 'react'

import { useIsInNavigationMode } from '../../../hooks/authorization/useIsInNavigationMode'
import { useGetVesselsLastPositionsNavQuery, useGetVesselsLastPositionsQuery } from '../apis'

export function useGetNavigationOrStandardApis() {
  const isInNavigationMode = useIsInNavigationMode()

  return useMemo(() => {
    if (isInNavigationMode) {
      return {
        useGetVesselsLastPositionsQuery: useGetVesselsLastPositionsNavQuery
      }
    }

    return {
      useGetVesselsLastPositionsQuery
    }
  }, [isInNavigationMode])
}
