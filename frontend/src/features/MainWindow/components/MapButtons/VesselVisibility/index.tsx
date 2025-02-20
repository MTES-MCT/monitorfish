import { MapBox } from '@features/Map/constants'
import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import { useRef } from 'react'
import styled from 'styled-components'

import { EditVesselVisibility } from './EditVesselVisibility'
import { setRightMapBoxOpened } from '../../../../../domain/shared_slices/Global'
import { MapToolButton } from '../shared/MapToolButton'

export function VesselVisibilityMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const isOpen = rightMapBoxOpened === MapBox.VESSEL_VISIBILITY
  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpen, () => {
    dispatch(setRightMapBoxOpened(undefined))
  })

  const openOrCloseVesselVisibility = () => {
    if (isOpen) {
      dispatch(setRightMapBoxOpened(undefined))

      return
    }

    dispatch(setRightMapBoxOpened(MapBox.VESSEL_VISIBILITY))
  }

  return (
    <Wrapper ref={wrapperRef}>
      <MapToolButton
        data-cy="vessel-visibility"
        Icon={Icon.Vessel}
        isActive={isOpen}
        onClick={openOrCloseVesselVisibility}
        style={{ top: 172 }}
        title="Affichage des dernières positions"
      />
      <EditVesselVisibility />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`
