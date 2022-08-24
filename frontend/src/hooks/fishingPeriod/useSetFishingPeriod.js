import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { setFishingPeriod } from '../../features/backoffice/Regulation.slice'

const useSetFishingPeriod = key => {
  const dispatch = useDispatch()
  const set = useCallback(
    value => {
      dispatch(setFishingPeriod({ key, value }))
    },
    [key, dispatch],
  )

  return set
}

export default useSetFishingPeriod
