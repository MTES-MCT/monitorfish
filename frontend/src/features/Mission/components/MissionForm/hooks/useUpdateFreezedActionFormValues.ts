import { useEffect, useRef } from 'react'

import type { MissionActionFormValues } from '../types'

export function useUpdateFreezedActionFormValues(
  freezedActionFormValues: MissionActionFormValues | undefined,
  actionsFormValues: MissionActionFormValues[],
  editedActionIndex: number | undefined,
  callback: (nextActionFormValues: MissionActionFormValues | undefined) => void
) {
  const formikEditedActionIndexRef = useRef<number | undefined>(undefined)
  const previousActionsFormValuesLength = useRef<number | undefined>(undefined)

  useEffect(() => {
    /**
     * Block update when only internal action data is modified, so when :
     * - The index of the edited action is unchanged
     * - The number of actions is unchanged
     */
    if (
      editedActionIndex !== undefined &&
      formikEditedActionIndexRef.current === editedActionIndex &&
      previousActionsFormValuesLength.current === actionsFormValues.length &&
      freezedActionFormValues
    ) {
      return
    }

    /**
     * When an action is deleted, reset the action displayed
     */
    if (editedActionIndex === undefined) {
      formikEditedActionIndexRef.current = undefined
      callback(undefined)

      return
    }

    formikEditedActionIndexRef.current = editedActionIndex
    previousActionsFormValuesLength.current = actionsFormValues.length
    callback(actionsFormValues[editedActionIndex])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsFormValues, editedActionIndex])
}
