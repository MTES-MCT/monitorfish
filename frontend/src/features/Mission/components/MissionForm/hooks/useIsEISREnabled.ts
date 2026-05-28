import { useMainAppSelector } from '@hooks/useMainAppSelector'

import { E_ISR_CONTROL_UNITS_FOR_TEST, E_ISR_ENABLED } from '../constants'

/** Pure helper — usable in non-React contexts (schemas, utils). */
export function computeIsEISREnabled(controlUnitIds: (number | undefined)[]): boolean {
  if (!E_ISR_ENABLED) {
    return false
  }

  if (E_ISR_CONTROL_UNITS_FOR_TEST.length === 0) {
    return true
  }

  return controlUnitIds.some(id => id !== undefined && E_ISR_CONTROL_UNITS_FOR_TEST.includes(id))
}

/** React hook for components inside the mission form. */
export function useIsEISREnabled(): boolean {
  const controlUnits = useMainAppSelector(state => state.missionForm.draft?.mainFormValues.controlUnits ?? [])

  return computeIsEISREnabled(controlUnits.map(cu => cu.id))
}
