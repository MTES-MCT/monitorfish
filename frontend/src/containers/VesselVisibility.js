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
          Ces seuils permettent de régler l&apos;affichage, l&apos;estompage et le masquage des dernières positions des navires.
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
  opacity: ${props => props.isShowed ? '1' : '0'};
  transition: all 0.2s;
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
  margin-right: ${props => props.vesselVisibilityBoxIsOpen ? '45px' : '-420px'};
  opacity: ${props => props.vesselVisibilityBoxIsOpen ? '1' : '0'};
  top: 152px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;

`

const VesselVisibilityIcon = styled.button`
  position: absolute;
  display: inline-block;
  color: #05055E;
  background: ${COLORS.grayDarkerThree};
  padding: 3px 0px 0 3px;
  margin-top: 8px;
  top: 144px;
  z-index: 99;
  height: 40px;
  width: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '10px'};
  transition: all 0.3s;

  :hover, :focus {
      background: ${COLORS.grayDarkerThree};
  }
`

const Vessel = styled(VesselSVG)`
  width: 25px;
  height: 25px;
  opacity: ${props => props.selectedVessel && !props.rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

export default VesselVisibility
