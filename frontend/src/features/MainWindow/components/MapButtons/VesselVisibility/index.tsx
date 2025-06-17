import { MapBox } from '@features/Map/constants'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { EditVesselVisibility } from './EditVesselVisibility'
import { displayedComponentActions } from '../../../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxDisplayed } from '../../../../../domain/use_cases/setRightMapBoxDisplayed'
import { MapToolButton } from '../shared/MapToolButton'

export function VesselVisibilityMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.VESSEL_VISIBILITY)

  const openOrCloseVesselVisibility = () => {
    if (isOpened) {
      dispatch(setRightMapBoxDisplayed(undefined))

      return
    }

    dispatch(setRightMapBoxDisplayed(MapBox.VESSEL_VISIBILITY))
    dispatch(displayedComponentActions.setDisplayedComponents({ isControlUnitListDialogDisplayed: false }))
  }

  return (
    <Wrapper>
      <MapToolButton
        data-cy="vessel-visibility"
        Icon={Icon.VesselTrackSettings}
        isActive={isOpened}
        onClick={openOrCloseVesselVisibility}
        style={{ top: 172 }}
        title="Affichage des dernières positions"
      />
      {isRendered && <EditVesselVisibility isOpened={isOpened} onClose={openOrCloseVesselVisibility} />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`
