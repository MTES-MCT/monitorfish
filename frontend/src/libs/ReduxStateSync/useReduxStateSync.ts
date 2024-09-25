import { useEffect } from 'react'

import { reduxStateSync } from '.'

export function useReduxStateSync(isSideWindow: boolean) {
  useEffect(() => {
    reduxStateSync.initialize(isSideWindow)
  }, [isSideWindow])
}
