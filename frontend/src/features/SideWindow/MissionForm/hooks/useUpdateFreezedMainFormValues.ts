import { useEffect } from 'react'

import type { MissionMainFormValues } from '../types'

export function useUpdateFreezedMainFormValues(
  freezedMainFormValues: MissionMainFormValues | undefined,
  mainFormValues: MissionMainFormValues | undefined,
  callback: (mainFormValues: MissionMainFormValues) => void
) {
  useEffect(() => {
    if (freezedMainFormValues) {
      return
    }

    if (!mainFormValues) {
      return
    }

    callback(mainFormValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainFormValues])
}
