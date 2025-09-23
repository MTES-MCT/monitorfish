import { isMissionActionFormValid } from '@features/Mission/components/MissionForm/utils/isMissionActionFormValid'
import { MissionAction } from '@features/Mission/missionAction.types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useFormikContext } from 'formik'
import { useEffect } from 'react'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

import CompletionStatus = MissionAction.CompletionStatus

export function UpdateMissionActionCompletionEffect() {
  const dispatch = useMainAppDispatch()
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  useEffect(() => {
    const isValid = isMissionActionFormValid(values, true, dispatch)
    const completion = isValid ? CompletionStatus.COMPLETED : CompletionStatus.TO_COMPLETE

    setFieldValue('completion', completion)

    // We don't want to trigger infinite re-renders since `setFieldValue` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  return null
}
