import { useIsEISREnabled } from '@features/Mission/components/MissionForm/hooks/useIsEISREnabled'
import { useFormikContext } from 'formik'
import { useEffect } from 'react'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

/**
 * Stamps the e-ISR mode on the action itself as soon as it applies, so that it survives a switch-off
 * of the flag, a change of the mission control units or an edit of the control date.
 *
 * It only ever writes `true`: an action that has been filled in under e-ISR must keep its form — and
 * its completion schema — for good.
 */
export function StampEISRModeEffect() {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()
  // Without the persisted flag, so this reads the environment rule rather than its own stamp.
  const isEISREnabled = useIsEISREnabled(values.actionDatetimeUtc)

  useEffect(() => {
    if (isEISREnabled && !values.isEISR) {
      setFieldValue('isEISR', true)
    }
  }, [isEISREnabled, setFieldValue, values.isEISR])

  return null
}
