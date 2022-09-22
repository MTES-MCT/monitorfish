import { useCallback, useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { MapToolType } from '../../../../domain/entities/map'
import { setMapToolOpened } from '../../../../domain/shared_slices/Global'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useClickOutsideWhenOpenedAndExecute } from '../../../../hooks/useClickOutsideWhenOpenedAndExecute'
import { ReactComponent as VesselSVG } from '../../../icons/standardized/Vessel.svg'
import { MapToolButton as VesselVisibilityButton } from '../MapToolButton'
import { EditVesselVisibility } from './EditVesselVisibility'

export function VesselVisibilityMapButton() {
  const dispatch = useDispatch()
  const { mapToolOpened, rightMenuIsOpen } = useAppSelector(state => state.global)

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
        dataCy="vessel-visibility"
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
