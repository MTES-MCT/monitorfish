import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { EditVesselVisibility } from './EditVesselVisibility'
import { MapToolType } from '../../../domain/entities/map/constants'
import { setMapToolOpened } from '../../../domain/shared_slices/Global'
import { useClickOutsideWhenOpenedAndExecute } from '../../../hooks/useClickOutsideWhenOpenedAndExecute'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import VesselSVG from '../../icons/standardized/Vessel.svg?react'
import { MapToolButton as VesselVisibilityButton } from '../shared/MapToolButton'

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
      <VesselVisibilityButton
        data-cy="vessel-visibility"
        isActive={isOpen}
        onClick={openOrCloseVesselVisibility}
        style={{ top: 152 }}
        title="Affichage des dernières positions"
      >
        <VesselIcon $isRightMenuShrinked={isRightMenuShrinked} />
      </VesselVisibilityButton>
      <EditVesselVisibility />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const VesselIcon = styled(VesselSVG)<{
  $isRightMenuShrinked: boolean
}>`
  height: 25px;
  opacity: ${p => (p.$isRightMenuShrinked ? '0' : '1')};
  transition: all 0.2s;
  width: 25px;

  path {
    fill: ${p => p.theme.color.gainsboro};
  }
`
