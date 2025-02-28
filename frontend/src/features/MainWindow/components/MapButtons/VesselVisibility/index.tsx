import { MapBox } from '@features/Map/constants'
import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import { useRef } from 'react'
import styled from 'styled-components'

import { EditVesselVisibility } from './EditVesselVisibility'
import { displayedComponentActions } from '../../../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxOpened } from '../../../../../domain/shared_slices/Global'
import { MapToolButton } from '../shared/MapToolButton'

export function VesselVisibilityMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.VESSEL_VISIBILITY)

  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpened, () => {
    dispatch(setRightMapBoxOpened(undefined))
  })

  const openOrCloseVesselVisibility = () => {
    if (isOpened) {
      dispatch(setRightMapBoxOpened(undefined))

      return
    }

    dispatch(setRightMapBoxOpened(MapBox.VESSEL_VISIBILITY))
    dispatch(displayedComponentActions.setDisplayedComponents({ isControlUnitListDialogDisplayed: false }))
  }

  return (
    <Wrapper ref={wrapperRef}>
      <MapToolButton
        data-cy="vessel-visibility"
        Icon={Icon.Vessel}
        isActive={isOpened}
        onClick={openOrCloseVesselVisibility}
        style={{ top: 172 }}
        title="Affichage des dernières positions"
      />
      {isRendered && <EditVesselVisibility isOpened={isOpened} />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`
