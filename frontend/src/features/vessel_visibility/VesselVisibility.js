import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as VesselSVG } from '../icons/Icone_navire.svg'
import { COLORS } from '../../constants/constants'
import LastPositionsSlider from './LastPositionsSlider'
import {
  setVesselLabel,
  setVesselLabelsShowedOnMap,
  setVesselsLastPositionVisibility,
  setVesselTrackDepth
} from '../../domain/shared_slices/Map'
import TrackDepthRadio from './TrackDepthRadio'
import VesselLabelSelection from './VesselLabelSelection'
import ShowVesselLabel from './ShowVesselLabel'
import { expandRightMenu } from '../../domain/shared_slices/Global'
import unselectVessel from '../../domain/use_cases/unselectVessel'
import ShowVesselEstimatedPositions from './ShowVesselEstimatedPositions'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { useClickOutsideComponent } from '../../hooks/useClickOutside'

const VesselVisibility = () => {
  const dispatch = useDispatch()
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const vesselsLastPositionVisibility = useSelector(state => state.map.vesselsLastPositionVisibility)
  const vesselTrackDepth = useSelector(state => state.map.vesselTrackDepth)
  const vesselLabel = useSelector(state => state.map.vesselLabel)
  const vesselLabelsShowedOnMap = useSelector(state => state.map.vesselLabelsShowedOnMap)
  const { healthcheckTextWarning } = useSelector(state => state.global)

  const [vesselVisibilityBoxIsOpen, setVesselVisibilityBoxIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideComponent(wrapperRef)

  useEffect(() => {
    if (clickedOutsideComponent) {
      setVesselVisibilityBoxIsOpen(false)
    }
  }, [clickedOutsideComponent])

  useEffect(() => {
    if (vesselVisibilityBoxIsOpen === true) {
      dispatch(unselectVessel())
    }
  }, [vesselVisibilityBoxIsOpen])

  const updateVesselsLastPositionVisibility = (hidden, opacityReduced) => {
    dispatch(setVesselsLastPositionVisibility({
      opacityReduced: opacityReduced,
      hidden: hidden
    }))
  }

  const updateVesselTrackDepth = depth => {
    dispatch(setVesselTrackDepth(depth))
  }

  const updateVesselLabel = label => {
    dispatch(setVesselLabel(label))
  }

  const updateVesselLabelsShowedOnMap = isShowed => {
    dispatch(setVesselLabelsShowedOnMap(isShowed))
  }

  return (
    <Wrapper ref={wrapperRef}>
      <VesselVisibilityIcon
        healthcheckTextWarning={healthcheckTextWarning}
        rightMenuIsOpen={rightMenuIsOpen}
        isOpen={vesselVisibilityBoxIsOpen}
        selectedVessel={selectedVessel}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Affichage des dernières positions'}
        onClick={() => setVesselVisibilityBoxIsOpen(!vesselVisibilityBoxIsOpen)}>
        <Vessel
          rightMenuIsOpen={rightMenuIsOpen}
          selectedVessel={selectedVessel}/>
      </VesselVisibilityIcon>
      <VesselVisibilityBox
        healthcheckTextWarning={healthcheckTextWarning}
        vesselVisibilityBoxIsOpen={vesselVisibilityBoxIsOpen}>
        <Header isFirst={true}>
          Gérer l&apos;affichage des dernières positions
        </Header>
        <LastPositionInfo>
          <VesselHidden/> navires masqués <VesselAlmostHidden/> navires estompés <VesselShowed/> navires normaux
        </LastPositionInfo>
        <LastPositionsSlider
          updateVesselsLastPositionVisibility={updateVesselsLastPositionVisibility}
          vesselsLastPositionVisibility={vesselsLastPositionVisibility}
        />
        <LastPositionLegend>
          Ces seuils permettent de régler l&apos;affichage, l&apos;estompage et le masquage des dernières positions des
          navires.
        </LastPositionLegend>
        <Header isFirst={false}>
          Paramétrer la longueur par défaut des pistes
        </Header>
        <TrackDepthRadio
          updateVesselTrackDepth={updateVesselTrackDepth}
          vesselTrackDepth={vesselTrackDepth}
        />
        <Header isFirst={false}>
          Gérer l&apos;affichage des étiquettes des navires
        </Header>
        <VesselLabel>
          Choisir le libellé des étiquettes des navires
        </VesselLabel>
        <VesselLabelSelection
          updateVesselLabel={updateVesselLabel}
          vesselLabel={vesselLabel}
        />
        <ShowVesselLabel
          updateVesselLabelsShowedOnMap={updateVesselLabelsShowedOnMap}
          vesselLabelsShowedOnMap={vesselLabelsShowedOnMap}
        />
        <ShowVesselEstimatedPositions/>
      </VesselVisibilityBox>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

const VesselLabel = styled.div`
  margin: 15px 5px 0 20px;
  font-size: 13px;
  color: ${COLORS.slateGray};
  text-align: left;
`

const LastPositionLegend = styled.div`
  margin: 5px 5px 15px 25px;
  font-size: 13px;
  color: ${COLORS.slateGray};
  text-align: left;
`

const VesselHidden = styled.span`
  background: #CCCFD6;
  border: unset;
  margin-right: 5px;
  width: 8px;
  height: 3px;
  display: inline-block;
  margin-bottom: 1px;
`

const VesselAlmostHidden = styled.span`
  background: #9095A2;
  border: unset;
  margin-right: 5px;
  margin-left: 25px;
  width: 8px;
  height: 3px;
  display: inline-block;
  margin-bottom: 1px;
`

const VesselShowed = styled.span`
  background: ${COLORS.charcoal};
  border: unset;
  margin-right: 5px;
  margin-left: 25px;
  width: 8px;
  height: 3px;
  display: inline-block;
  margin-bottom: 1px;
`

const LastPositionInfo = styled.div`
  font-size: 10px;
  margin: 15px;
  color: ${COLORS.gunMetal};
`

const Header = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${props => props.isFirst ? '2px' : '0'};
  border-top-right-radius: ${props => props.isFirst ? '2px' : '0'};
`

const VesselVisibilityBox = styled(MapComponentStyle)`
  width: 406px;
  background: ${COLORS.background};
  margin-right: ${props => props.vesselVisibilityBoxIsOpen ? '45px' : '-420px'};
  opacity: ${props => props.vesselVisibilityBoxIsOpen ? '1' : '0'};
  top: 152px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
`

const VesselVisibilityIcon = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  padding: 3px 0px 0 3px;
  top: 152px;
  z-index: 99;
  height: 40px;
  width: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px'};
  background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  transition: all 0.3s;
  
  :hover, :focus {
      background: ${props => props.isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const Vessel = styled(VesselSVG)`
  width: 25px;
  height: 25px;
  opacity: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

export default VesselVisibility
