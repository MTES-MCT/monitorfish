import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { MapTool } from '../../../../domain/entities/map'
import { setMapToolOpened } from '../../../../domain/shared_slices/Global'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useClickOutsideWhenOpened } from '../../../../hooks/useClickOutsideWhenOpened'
import { ReactComponent as LabelSVG } from '../../../icons/standardized/Tag.svg'
import { MapToolButton } from '../MapToolButton'
import EditVesselLabels from './EditVesselLabels'

export function VesselLabelsMapButton() {
  const dispatch = useDispatch()
  const { mapToolOpened, rightMenuIsOpen } = useAppSelector(state => state.global)

  const isRightMenuShrinked = !rightMenuIsOpen
  const isOpen = useMemo(() => mapToolOpened === MapTool.VESSEL_LABELS, [mapToolOpened])
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isOpen)

  useEffect(() => {
    if (clickedOutsideComponent && isOpen) {
      dispatch(setMapToolOpened(undefined))
    }
  }, [clickedOutsideComponent, isOpen])

  const openOrCloseVesselLabels = useCallback(() => {
    if (!isOpen) {
      dispatch(setMapToolOpened(MapTool.VESSEL_LABELS))
    } else {
      dispatch(setMapToolOpened(undefined))
    }
  }, [dispatch, isOpen])

  return (
    <Wrapper ref={wrapperRef}>
      <VesselLabelsButton
        dataCy="vessel-labels"
        isOpen={isOpen}
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
  width: 27px;
  height: 27px;
  opacity: ${props => (props.$isRightMenuShrinked ? '0' : '1')};
  transition: all 0.2s;
  path {
    fill: ${p => p.theme.color.gainsboro};
  }
  g > g {
    stroke: ${p => p.theme.color.gainsboro};
  }
`
