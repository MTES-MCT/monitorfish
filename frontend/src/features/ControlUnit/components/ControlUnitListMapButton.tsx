import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'

import { displayedComponentActions } from '../../../domain/shared_slices/DisplayedComponent'

export function ControlUnitListMapButton() {
  const dispatch = useMainAppDispatch()
  const isControlUnitDialogDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitDialogDisplayed
  )
  const isControlUnitListDialogDisplayed = useMainAppSelector(
    state => state.displayedComponent.isControlUnitListDialogDisplayed
  )

  const toggle = () => {
    const willBeControlUnitListDialogDisplayed = !isControlUnitListDialogDisplayed
    const willBeControlUnitListgDisplayed = isControlUnitDialogDisplayed && !willBeControlUnitListDialogDisplayed

    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isControlUnitDialogDisplayed: willBeControlUnitListgDisplayed,
        isControlUnitListDialogDisplayed: willBeControlUnitListDialogDisplayed
      })
    )
  }

  return (
    <MapToolButton
      Icon={Icon.ControlUnit}
      isActive={isControlUnitListDialogDisplayed || isControlUnitDialogDisplayed}
      onClick={toggle}
      style={{ top: 268 }}
      title="Liste des unités de contrôle"
    />
  )
}
