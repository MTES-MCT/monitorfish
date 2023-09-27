import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'

import EditVesselLabels from './EditVesselLabels'
import { MapToolType } from '../../../domain/entities/map/constants'
import { setMapToolOpened } from '../../../domain/shared_slices/Global'
import { useClickOutsideWhenOpenedAndExecute } from '../../../hooks/useClickOutsideWhenOpenedAndExecute'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import LabelSVG from '../../icons/standardized/Tag.svg?react'
import { MapToolButton } from '../shared/MapToolButton'

export function VesselLabelsMapButton() {
  const dispatch = useMainAppDispatch()
  const { mapToolOpened, rightMenuIsOpen } = useMainAppSelector(state => state.global)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => mapToolOpened === MapToolType.VESSEL_LABELS, [mapToolOpened])
  const wrapperRef = useRef(null)

  useClickOutsideWhenOpenedAndExecute(wrapperRef, isOpen, () => {
    dispatch(setMapToolOpened(undefined))
  })

  const openOrCloseVesselLabels = useCallback(() => {
    if (!isOpen) {
      dispatch(setMapToolOpened(MapToolType.VESSEL_LABELS))
    } else {
      dispatch(setMapToolOpened(undefined))
    }
  }, [dispatch, isOpen])

  return (
    <Wrapper ref={wrapperRef}>
      <VesselLabelsButton
        dataCy="vessel-labels"
        isActive={isOpen}
        onClick={openOrCloseVesselLabels}
        style={{ top: 194 }}
        title="Affichage des dernières positions"
      >
        <LabelIcon $isRightMenuShrinked={isRightMenuShrinked} />
      </VesselLabelsButton>
      <EditVesselLabels />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const VesselLabelsButton = styled(MapToolButton)``

const LabelIcon = styled(LabelSVG)<{
  $isRightMenuShrinked: boolean
}>`
  height: 27px;
  opacity: ${props => (props.$isRightMenuShrinked ? '0' : '1')};
  transition: all 0.2s;
  width: 27px;

  path {
    fill: ${p => p.theme.color.gainsboro};
  }

  g > g {
    stroke: ${p => p.theme.color.gainsboro};
  }
`
