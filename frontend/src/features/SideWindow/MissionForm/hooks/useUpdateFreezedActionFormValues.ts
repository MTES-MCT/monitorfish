import { useEffect, useRef } from 'react'

import type { MissionActionFormValues } from '../types'

export function useUpdateFreezedActionFormValues(
  freezedActionFormValues: MissionActionFormValues | undefined,
  actionsFormValues: MissionActionFormValues[],
  editedActionIndex: number | undefined,
  callback: (nextActionFormValues: MissionActionFormValues | undefined) => void
) {
  const formikEditedActionIndexRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (
      editedActionIndex !== undefined &&
      formikEditedActionIndexRef.current === editedActionIndex &&
      freezedActionFormValues
    ) {
      return
    }

    if (editedActionIndex === undefined) {
      formikEditedActionIndexRef.current = undefined
      callback(undefined)

      return
    }

    formikEditedActionIndexRef.current = editedActionIndex
    callback(actionsFormValues[editedActionIndex])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsFormValues, editedActionIndex])
}
