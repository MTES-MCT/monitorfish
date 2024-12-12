// TODO Move that into BackOffice feature.

import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useCallback } from 'react'

import { regulationActions } from '../../features/Regulation/slice'

export function useSetFishingPeriod(key: string) {
  const dispatch = useBackofficeAppDispatch()

  const set = useCallback(
    value => {
      dispatch(regulationActions.setFishingPeriod({ key, value }))
    },
    [key, dispatch]
  )

  return set
}
