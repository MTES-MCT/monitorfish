import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as VesselSVG } from '../components/icons/Icone_navire.svg'
import { COLORS } from '../constants/constants'
import LastPositionsSlider from '../components/vessel_visibility/LastPositionsSlider'
import {
  setVesselLabel,
  setVesselLabelsShowedOnMap,
  setVesselsLastPositionVisibility,
  setVesselTrackDepth
} from '../domain/reducers/Map'
import TrackDepthRadio from '../components/vessel_visibility/TrackDepthRadio'
import VesselLabelRadio from '../components/vessel_visibility/VesselLabelRadio'
import VesselLabelCheckbox from '../components/vessel_visibility/VesselLabelCheckbox'
import { expandRightMenu } from '../domain/reducers/Global'
import unselectVessel from '../domain/use_cases/unselectVessel'

const VesselVisibility = () => {
  const dispatch = useDispatch()
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const vesselsLastPositionVisibility = useSelector(state => state.map.vesselsLastPositionVisibility)
  const vesselTrackDepth = useSelector(state => state.map.vesselTrackDepth)
  const vesselLabel = useSelector(state => state.map.vesselLabel)
  const vesselLabelsShowedOnMap = useSelector(state => state.map.vesselLabelsShowedOnMap)
  const temporaryVesselsToHighLightOnMap = useSelector(state => state.vessel.temporaryVesselsToHighLightOnMap)

  const firstUpdate = useRef(true)
  const [vesselVisibilityBoxIsOpen, setVesselVisibilityBoxIsOpen] = useState(false)
  const [isShowed, setIsShowed] = useState(true)

  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside (event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setVesselVisibilityBoxIsOpen(false)
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [wrapperRef])

  useEffect(() => {
    if (vesselVisibilityBoxIsOpen === true) {
      dispatch(unselectVessel())
      firstUpdate.current = false
    }
  }, [vesselVisibilityBoxIsOpen])

  useEffect(() => {
    if (temporaryVesselsToHighLightOnMap && temporaryVesselsToHighLightOnMap.length) {
      setIsShowed(false)
    } else {
      setIsShowed(true)
    }
  }, [temporaryVesselsToHighLightOnMap])

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
    <Wrapper isShowed={isShowed} ref={wrapperRef}>
      <VesselVisibilityIcon
        rightMenuIsOpen={rightMenuIsOpen}
        selectedVessel={selectedVessel}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Affichage des dernières positions'}
        onClick={() => setVesselVisibilityBoxIsOpen(!vesselVisibilityBoxIsOpen)}>
        <Vessel
          rightMenuIsOpen={rightMenuIsOpen}
          selectedVessel={selectedVessel}/>
      </VesselVisibilityIcon>
      <VesselVisibilityBox
        vesselVisibilityBoxIsOpen={vesselVisibilityBoxIsOpen}
        firstUpdate={firstUpdate.current}>
        <Header isFirst={true}>
          Gérer l'affichage des dernières positions
        </Header>
        <LastPositionInfo>
          <VesselHidden/> navires masqués <VesselAlmostHidden/> navires estompés <VesselShowed/> navires normaux
        </LastPositionInfo>
        <LastPositionsSlider
          updateVesselsLastPositionVisibility={updateVesselsLastPositionVisibility}
          vesselsLastPositionVisibility={vesselsLastPositionVisibility}
        />
        <LastPositionLegend>
          Ces seuils permettent de régler l'affichage, l'estompage et le masquage des dernières positions des navires.
        </LastPositionLegend>
        <Header isFirst={false}>
          Paramétrer la longueur par défaut des pistes
        </Header>
        <TrackDepthRadio
          updateVesselTrackDepth={updateVesselTrackDepth}
          vesselTrackDepth={vesselTrackDepth}
        />
        <Header isFirst={false}>
          Gérer l'affichage des étiquettes des navires
        </Header>
        <VesselLabel>
          Choisir le libellé des étiquettes des navires
        </VesselLabel>
        <VesselLabelRadio
          updateVesselLabel={updateVesselLabel}
          vesselLabel={vesselLabel}
        />
        <ShowVesselLabel>
          <VesselLabelCheckbox
            updateVesselLabelsShowedOnMap={updateVesselLabelsShowedOnMap}
            vesselLabelsShowedOnMap={vesselLabelsShowedOnMap}
          />
        </ShowVesselLabel>
      </VesselVisibilityBox>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  animation: ${props => props.isShowed ? `vessel-visibility-opening` : `vessel-visibility-closing`} 0.2s ease forwards;
  @keyframes vessel-visibility-opening {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes vessel-visibility-closing {
    0%   { opacity: 1; }
    100% { opacity: 0; }
  }
  z-index: 1000;
`

const ShowVesselLabel = styled.div`
  background: ${COLORS.grayBackground};
  padding: 0 0 9px 13px;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
`

const VesselLabel = styled.div`
  margin: 15px 5px 0 20px;
  font-size: 13px;
  color: ${COLORS.textGray};
  text-align: left;
`

const LastPositionLegend = styled.div`
  margin: 5px 5px 15px 25px;
  font-size: 13px;
  color: ${COLORS.textGray};
  text-align: left;
`

const VesselHidden = styled.span`
  background: #E0E0E0;
  border: unset;
  margin-right: 5px;
  width: 8px;
  height: 3px;
  display: inline-block;
  margin-bottom: 1px;
`

const VesselAlmostHidden = styled.span`
  background: ${COLORS.grayVesselHidden};
  border: unset;
  margin-right: 5px;
  margin-left: 25px;
  width: 8px;
  height: 3px;
  display: inline-block;
  margin-bottom: 1px;
`

const VesselShowed = styled.span`
  background: ${COLORS.grayDarkerThree};
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
  color: ${COLORS.grayDarkerThree};
`

const Header = styled.div`
  background: ${COLORS.textGray};
  color: ${COLORS.grayBackground};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${props => props.isFirst ? '2px' : '0'};
  border-top-right-radius: ${props => props.isFirst ? '2px' : '0'};
`

const VesselVisibilityBox = styled.div`
  width: 406px;
  background: ${COLORS.background};
  margin-right: -420px;
  top: 110px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  animation: ${props => props.firstUpdate && !props.vesselVisibilityBoxIsOpen ? '' : props.vesselVisibilityBoxIsOpen ? 'vessel-visibility-box-opening' : 'vessel-visibility-box-closing'} 0.5s ease forwards;

  @keyframes vessel-visibility-box-opening {
    0%   { margin-right: -420px; opacity: 0;  }
    100% { margin-right: 45px; opacity: 1; }
  }

  @keyframes vessel-visibility-box-closing {
    0% { margin-right: 45px; opacity: 1; }
    100%   { margin-right: -420px; opacity: 0;  }
  }
`

const VesselVisibilityIcon = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${COLORS.grayDarkerThree};
  padding: 3px 0px 0 3px;
  top: 102px;
  z-index: 99;
  right: 10px;
  height: 40px;
  width: 40px;
  border-radius: 2px;
  margin-top: 8px;
  
  animation: ${props => props.selectedVessel && !props.rightMenuIsOpen ? 'vessel-visibility-icon-closing' : 'vessel-visibility-icon-opening'} 0.3s ease forwards;
  
  @keyframes vessel-visibility-icon-opening {
    0%   {
      width: 5px;
      border-radius: 1px;
      right: 0;
     }
    100% {
      width: 40px;
      border-radius: 2px;
      right: 10px;
    }
  }

  @keyframes vessel-visibility-icon-closing {
    0% {
      width: 40px;
      border-radius: 2px;
      right: 10px;
    }
    100%   {
      width: 5px;
      border-radius: 1px;
      right: 0;
    }
  }

  :hover, :focus {
      background: ${COLORS.grayDarkerThree};
  }
`

const Vessel = styled(VesselSVG)`
  width: 25px;
  height: 25px;
  animation: ${props => props.selectedVessel && !props.rightMenuIsOpen ? 'visibility-icon-hidden' : 'visibility-icon-visible'} 0.2s ease forwards;
  
  @keyframes visibility-icon-visible {
    0%   {
      opacity: 0;
     }
    100% {
      opacity: 1;
    }
  }

  @keyframes visibility-icon-hidden {
    0% {
      opacity: 1;
    }
    100%   {
      opacity: 0;
    }
  }
`

export default VesselVisibility
