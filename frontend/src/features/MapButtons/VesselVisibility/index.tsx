import { useClickOutsideWhenOpenedAndExecute } from '@hooks/useClickOutsideWhenOpenedAndExecute'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { EditVesselVisibility } from './EditVesselVisibility'
import { MapToolType } from '../../../domain/entities/map/constants'
import { setMapToolOpened } from '../../../domain/shared_slices/Global'
import { MapToolButton } from '../shared/MapToolButton'

export function VesselVisibilityMapButton() {
  const dispatch = useMainAppDispatch()
  const { mapToolOpened, rightMenuIsOpen } = useMainAppSelector(state => state.global)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => mapToolOpened === MapToolType.VESSEL_VISIBILITY, [mapToolOpened])
  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpen, () => {
    dispatch(setMapToolOpened(undefined))
  })

  const openOrCloseVesselVisibility = useCallback(() => {
    if (isOpen) {
      dispatch(setMapToolOpened(undefined))
    } else {
      dispatch(setMapToolOpened(MapToolType.VESSEL_VISIBILITY))
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
