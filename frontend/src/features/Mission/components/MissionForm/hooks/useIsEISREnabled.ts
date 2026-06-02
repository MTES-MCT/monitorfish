import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { E_ISR_APPLICATION_DATE, E_ISR_CONTROL_UNITS_FOR_TEST, E_ISR_ENABLED } from '../constants'

/** Pure helper — usable in non-React contexts (schemas, utils). */
export function computeIsEISREnabled(controlUnitIds: (number | undefined)[], actionDatetimeUtc?: string): boolean {
  if (!E_ISR_ENABLED) {
    return false
  }

  // Controls performed before the e-ISR go-live date are not subject to e-ISR.
  if (E_ISR_APPLICATION_DATE && actionDatetimeUtc && customDayjs(actionDatetimeUtc).isBefore(E_ISR_APPLICATION_DATE)) {
    return false
  }

  if (E_ISR_CONTROL_UNITS_FOR_TEST.length === 0) {
    return true
  }

  return controlUnitIds.some(id => id !== undefined && E_ISR_CONTROL_UNITS_FOR_TEST.includes(id))
}

/** React hook for components inside the mission form. */
export function useIsEISREnabled(actionDatetimeUtc?: string): boolean {
  const controlUnits = useMainAppSelector(state => state.missionForm.draft?.mainFormValues.controlUnits ?? [])

  return computeIsEISREnabled(
    controlUnits.map(cu => cu.id),
    actionDatetimeUtc
  )
}
