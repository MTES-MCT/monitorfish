import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { E_ISR_APPLICATION_DATE, E_ISR_CONTROL_UNITS_FOR_TEST, E_ISR_ENABLED } from '../constants'

/** Pure helper — usable in non-React contexts (schemas, utils). */
export function computeIsEISREnabled(
  controlUnitIds: (number | undefined)[],
  actionDatetimeUtc?: string,
  persistedIsEISR?: boolean
): boolean {
  // Reading an existing action: it keeps the form it was filled in, whatever the environment says
  // now. Without this, turning the flag off — or merely changing the mission control unit — would
  // reopen it under the pre-ISR completion schema and downgrade it back to `TO_COMPLETE`.
  if (persistedIsEISR) {
    return true
  }

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
export function useIsEISREnabled(actionDatetimeUtc?: string, persistedIsEISR?: boolean): boolean {
  const controlUnits = useMainAppSelector(state => state.missionForm.draft?.mainFormValues.controlUnits ?? [])

  return computeIsEISREnabled(
    controlUnits.map(cu => cu.id),
    actionDatetimeUtc,
    persistedIsEISR
  )
}
