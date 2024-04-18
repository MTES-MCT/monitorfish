import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { EditVesselVisibility } from './EditVesselVisibility'
import { MapBox } from '../../../domain/entities/map/constants'
import { setRightMapBoxOpened } from '../../../domain/shared_slices/Global'
import { MapToolButton } from '../shared/MapToolButton'

export function VesselVisibilityMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => rightMapBoxOpened === MapBox.VESSEL_VISIBILITY, [rightMapBoxOpened])
  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpen, () => {
    dispatch(setRightMapBoxOpened(undefined))
  })

  const openOrCloseVesselVisibility = useCallback(() => {
    if (isOpen) {
      dispatch(setRightMapBoxOpened(undefined))
    } else {
      dispatch(setRightMapBoxOpened(MapBox.VESSEL_VISIBILITY))
    }
  }, [dispatch, isOpen])

  return (
    <Wrapper ref={wrapperRef}>
      <MapToolButton
        data-cy="vessel-visibility"
        isActive={isOpen}
        onClick={openOrCloseVesselVisibility}
        style={{ top: 152 }}
        title="Affichage des dernières positions"
      >
        <Icon.Vessel color={isRightMenuShrinked ? THEME.color.charcoal : THEME.color.gainsboro} size={26} />
      </MapToolButton>
      <EditVesselVisibility />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`
