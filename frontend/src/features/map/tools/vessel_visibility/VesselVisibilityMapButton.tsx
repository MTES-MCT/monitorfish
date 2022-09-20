import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { MapTool } from '../../../../domain/entities/map'
import { setMapToolOpened } from '../../../../domain/shared_slices/Global'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useClickOutsideWhenOpened } from '../../../../hooks/useClickOutsideWhenOpened'
import { ReactComponent as VesselSVG } from '../../../icons/standardized/Vessel.svg'
import { MapToolButton } from '../MapToolButton'
import { EditVesselVisibility } from './EditVesselVisibility'

export function VesselVisibilityMapButton() {
  const dispatch = useDispatch()
  const { mapToolOpened, rightMenuIsOpen } = useAppSelector(state => state.global)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => mapToolOpened === MapTool.VESSEL_VISIBILITY, [mapToolOpened])
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isOpen)

  useEffect(() => {
    if (clickedOutsideComponent) {
      dispatch(setMapToolOpened(undefined))
    }
  }, [clickedOutsideComponent])

  const openOrCloseVesselVisibility = useCallback(() => {
    if (isOpen) {
      dispatch(setMapToolOpened(undefined))
    } else {
      dispatch(setMapToolOpened(MapTool.VESSEL_VISIBILITY))
    }
  }, [dispatch, isOpen])

  return (
    <Wrapper ref={wrapperRef}>
      <VesselVisibilityButton
        dataCy="open-vessels-visibility"
        isOpen={isOpen}
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

const VesselVisibilityButton = styled(MapToolButton)``

const VesselIcon = styled(VesselSVG)<{
  $isRightMenuShrinked: boolean
}>`
  width: 25px;
  height: 25px;
  opacity: ${p => (p.$isRightMenuShrinked ? '0' : '1')};
  transition: all 0.2s;
  path {
    fill: ${p => p.theme.color.gainsboro};
  }
`
