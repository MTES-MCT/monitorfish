// TODO Move that into BackOffice feature.

import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useCallback } from 'react'

import { setFishingPeriod } from '../../features/Regulation/slice.backoffice'

export function useSetFishingPeriod(key: string) {
  const dispatch = useBackofficeAppDispatch()

  const set = useCallback(
    value => {
      dispatch(setFishingPeriod({ key, value }))
    },
    [key, dispatch]
  )

  return set
}
