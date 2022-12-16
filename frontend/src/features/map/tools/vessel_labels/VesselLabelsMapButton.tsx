import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { MapToolType } from '../../../../domain/entities/map/constants'
import { setMapToolOpened } from '../../../../domain/shared_slices/Global'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { useClickOutsideWhenOpenedAndExecute } from '../../../../hooks/useClickOutsideWhenOpenedAndExecute'
import { ReactComponent as LabelSVG } from '../../../icons/standardized/Tag.svg'
import { MapToolButton } from '../MapToolButton'
import EditVesselLabels from './EditVesselLabels'

export function VesselLabelsMapButton() {
  const dispatch = useAppDispatch()
  const { mapToolOpened, rightMenuIsOpen } = useAppSelector(state => state.global)

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
