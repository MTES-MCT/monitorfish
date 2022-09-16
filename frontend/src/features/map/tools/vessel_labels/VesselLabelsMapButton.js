import { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as LabelSVG } from '../../../icons/Menu_etiquettes_navires.svg'
import { expandRightMenu, setMapToolOpened } from '../../../../domain/shared_slices/Global'
import { useClickOutsideWhenOpened } from '../../../../hooks/useClickOutsideWhenOpened'
import { MapTool } from '../../../../domain/entities/map'
import EditVesselLabels from './EditVesselLabels'
import { MapToolButton } from '../MapToolButton'

const VesselLabelsMapButton = () => {
  const dispatch = useDispatch()
  const {
    selectedVessel
  } = useSelector(state => state.vessel)
  const {
    healthcheckTextWarning,
    previewFilteredVesselsMode,
    rightMenuIsOpen,
    mapToolOpened
  } = useSelector(state => state.global)

  const isOpen = useMemo(() => mapToolOpened === MapTool.VESSEL_LABELS, [mapToolOpened])
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isOpen)

  useEffect(() => {
    if (clickedOutsideComponent) {
      dispatch(setMapToolOpened(undefined))
    }
  }, [clickedOutsideComponent])

  function openOrCloseVesselLabels () {
    if (!isOpen) {
      dispatch(setMapToolOpened(MapTool.VESSEL_LABELS))
    } else {
      dispatch(setMapToolOpened(undefined))
    }
  }

  return (
    <Wrapper ref={wrapperRef}>
      <VesselLabelsButton
        data-cy={'vessel-labels'}
        isHidden={previewFilteredVesselsMode}
        healthcheckTextWarning={healthcheckTextWarning}
        $rightMenuIsOpen={rightMenuIsOpen}
        $isOpen={isOpen}
        $selectedVessel={selectedVessel}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Affichage des dernières positions'}
        onClick={openOrCloseVesselLabels}>
        <LabelIcon
          $rightMenuIsOpen={rightMenuIsOpen}
          $selectedVessel={selectedVessel}
        />
      </VesselLabelsButton>
      <EditVesselLabels/>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const VesselLabelsButton = styled(MapToolButton)`
  top: 194px;
`

const LabelIcon = styled(LabelSVG)`
  width: 40px;
  opacity: ${props => props.$selectedVessel && !props.$rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

export default VesselLabelsMapButton
