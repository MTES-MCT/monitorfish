import { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as VesselSVG } from '../../../icons/Icone_navire.svg'
import { expandRightMenu, setMapToolOpened } from '../../../../domain/shared_slices/Global'
import { useClickOutsideWhenOpened } from '../../../../hooks/useClickOutsideWhenOpened'
import { MapTool } from '../../../../domain/entities/map'
import EditVesselVisibility from './EditVesselVisibility'
import { MapToolButton } from '../MapToolButton'

const VesselVisibilityMapButton = () => {
  const dispatch = useDispatch()
  const {
    selectedVessel
  } = useSelector(state => state.vessel)
  const {
    rightMenuIsOpen,
    previewFilteredVesselsMode,
    healthcheckTextWarning,
    mapToolOpened
  } = useSelector(state => state.global)

  const isOpen = useMemo(() => mapToolOpened === MapTool.VESSEL_VISIBILITY, [mapToolOpened])
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideWhenOpened(wrapperRef, isOpen)

  useEffect(() => {
    if (clickedOutsideComponent) {
      dispatch(setMapToolOpened(undefined))
    }
  }, [clickedOutsideComponent])

  function openOrCloseVesselVisibility () {
    if (isOpen) {
      dispatch(setMapToolOpened(undefined))
    } else {
      dispatch(setMapToolOpened(MapTool.VESSEL_VISIBILITY))
    }
  }

  return (
    <Wrapper ref={wrapperRef}>
      <VesselVisibilityButton
        data-cy={'open-vessels-visibility'}
        isHidden={previewFilteredVesselsMode}
        healthcheckTextWarning={healthcheckTextWarning}
        rightMenuIsOpen={rightMenuIsOpen}
        isOpen={isOpen}
        selectedVessel={selectedVessel}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Affichage des dernières positions'}
        onClick={openOrCloseVesselVisibility}>
        <VesselIcon
          $rightMenuIsOpen={rightMenuIsOpen}
          $selectedVessel={selectedVessel}/>
      </VesselVisibilityButton>
      <EditVesselVisibility/>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const VesselVisibilityButton = styled(MapToolButton)`
  top: 152px;
`

const VesselIcon = styled(VesselSVG)`
  width: 25px;
  height: 25px;
  opacity: ${props => props.$selectedVessel && !props.$rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

export default VesselVisibilityMapButton
