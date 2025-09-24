import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { MapSettings } from './MapSettings'
import { displayedComponentActions } from '../../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxDisplayed } from '../../../../domain/use_cases/setRightMapBoxDisplayed'

export function MapSettingsButton() {
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
      {isRendered && <MapSettings isOpened={isOpened} onClose={openOrCloseVesselVisibility} />}
      <MapToolButton
        data-cy="vessel-visibility"
        Icon={Icon.MapSettings}
        isActive={isOpened}
        onClick={openOrCloseVesselVisibility}
        title="Affichage des dernières positions"
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`
