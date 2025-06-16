import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'

import { displayedComponentActions } from '../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxDisplayed } from '../../../domain/use_cases/setRightMapBoxDisplayed'

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

    // TODO Used to manage rightMapBoxOpened boxes and displayedComponent boxes closure.
    // TODO Merge both slices
    if (willBeControlUnitListDialogDisplayed) {
      dispatch(setRightMapBoxDisplayed(undefined))
    }

    const willBeControlUnitDialogDisplayed = isControlUnitDialogDisplayed && !willBeControlUnitListDialogDisplayed

    dispatch(
      displayedComponentActions.setDisplayedComponents({
        isControlUnitDialogDisplayed: willBeControlUnitDialogDisplayed,
        isControlUnitListDialogDisplayed: willBeControlUnitListDialogDisplayed
      })
    )
  }

  return (
    <MapToolButton
      Icon={Icon.ControlUnit}
      isActive={isControlUnitListDialogDisplayed || isControlUnitDialogDisplayed}
      onClick={toggle}
      style={{ top: 220 }}
      title="Liste des unités de contrôle"
    />
  )
}
