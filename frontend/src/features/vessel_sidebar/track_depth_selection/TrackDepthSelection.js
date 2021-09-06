import React, { useEffect, useRef, useState } from 'react'
import TrackDepthRadio from './TrackDepthRadio'
import TrackDepthDateRange from './TrackDepthDateRange'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as VesselSVG } from '../../icons/Icone_navire.svg'
import { VesselTrackDepth } from '../../../domain/entities/vesselTrackDepth'
import { useDispatch, useSelector } from 'react-redux'
import { MapComponentStyle } from '../../commonStyles/MapComponent.style'
import TrackPositionsTable from './TrackPositionsTable'
import { setTemporaryTrackDepth } from '../../../domain/shared_slices/Vessel'
import showVesselTrackAndSidebar from '../../../domain/use_cases/showVesselTrackAndSidebar'

const TrackDepthSelection = props => {
  const dispatch = useDispatch()

  const { healthcheckTextWarning } = useSelector(state => state.global)
  const { selectedVesselIdentity } = useSelector(state => state.vessel)
  const vesselTrackDepth = useSelector(state => state.map.vesselTrackDepth)

  const [datesSelection, setDateSelection] = useState([])
  const [trackDepthRadioSelection, setTrackDepthRadioSelection] = useState(null)
  const firstUpdate = useRef(true)

  useEffect(() => {
    setDateSelection([])
    setTrackDepthRadioSelection(vesselTrackDepth)
  }, [props.init])

  useEffect(() => {
    if (vesselTrackDepth && !trackDepthRadioSelection) {
      setTrackDepthRadioSelection(vesselTrackDepth)
    }
  }, [vesselTrackDepth])

  useEffect(() => {
    if (trackDepthRadioSelection) {
      if (firstUpdate.current) {
        firstUpdate.current = false
        return
      }

      showVesselTrackWithTrackDepth(trackDepthRadioSelection, null, null)
      setDateSelection([])
    }
  }, [trackDepthRadioSelection])

  const convertToUTCDay = datesSelection => {
    const afterDateTime = new Date(datesSelection[0].getTime())
    const beforeDateTime = new Date(datesSelection[1].getTime())

    afterDateTime.setHours(0, 0, 0)
    beforeDateTime.setHours(23, 59, 59)

    afterDateTime.setMinutes(afterDateTime.getMinutes() - afterDateTime.getTimezoneOffset())
    beforeDateTime.setMinutes(beforeDateTime.getMinutes() - beforeDateTime.getTimezoneOffset())

    return { afterDateTime, beforeDateTime }
  }

  useEffect(() => {
    if (datesSelection?.length > 1) {
      if (firstUpdate.current) {
        firstUpdate.current = false
        return
      }

      const { afterDateTime, beforeDateTime } = convertToUTCDay(datesSelection)
      showVesselTrackWithTrackDepth(VesselTrackDepth.CUSTOM, afterDateTime, beforeDateTime)
      setTrackDepthRadioSelection(null)
    } else if (!trackDepthRadioSelection) {
      setTrackDepthRadioSelection(vesselTrackDepth)
    }
  }, [datesSelection])

  const showVesselTrackWithTrackDepth = (trackDepth, afterDateTime, beforeDateTime) => {
    const trackDepthObject = {
      trackDepth: trackDepth,
      afterDateTime: afterDateTime,
      beforeDateTime: beforeDateTime
    }

    dispatch(setTemporaryTrackDepth(trackDepthObject))
    if (selectedVesselIdentity && trackDepth) {
      dispatch(showVesselTrackAndSidebar(
        selectedVesselIdentity,
        false,
        false,
        trackDepthObject))
    }
  }

  return (
    <>
      <TrackDepthSelectionButton
        healthcheckTextWarning={healthcheckTextWarning}
        openBox={props.openBox}
        firstUpdate={firstUpdate.current}
        rightMenuIsOpen={props.rightMenuIsOpen}
        trackDepthSelectionIsOpen={props.trackDepthSelectionIsOpen}
        onClick={() => props.setTrackDepthSelectionIsOpen(!props.trackDepthSelectionIsOpen)}
        data-cy={'vessel-track-depth-selection'}
      >
        <ClockIcon/>
      </TrackDepthSelectionButton>
      <TrackDepthSelectionContent
        healthcheckTextWarning={healthcheckTextWarning}
        openBox={props.openBox}
        firstUpdate={firstUpdate.current}
        rightMenuIsOpen={props.rightMenuIsOpen}
        trackDepthSelectionIsOpen={props.trackDepthSelectionIsOpen}
      >
        <Header>Paramétrer l&apos;affichage de la piste VMS</Header>
        <TrackDepthRadio
          vesselTrackDepth={vesselTrackDepth}
          showVesselTrackWithTrackDepth={showVesselTrackWithTrackDepth}
          trackDepthRadioSelection={trackDepthRadioSelection}
          setTrackDepthRadioSelection={setTrackDepthRadioSelection}
        />
        <TrackDepthDateRange
          dates={datesSelection}
          setDate={setDateSelection}
        />
        <Header>Liste des positions VMS affichées</Header>
        <TrackPositionsTable />
      </TrackDepthSelectionContent>
    </>
  )
}

const Header = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 5px 0 5px 15px;
  font-size: 13px;
  text-align: left;
`

const TrackDepthSelectionButton = styled(MapComponentStyle)`
  top: 118px;
  height: 30px;
  width: 30px;
  background: ${props => props.trackDepthSelectionIsOpen ? COLORS.shadowBlue : COLORS.charcoal};
  position: absolute;
  right: 10px;
  margin-right: -45px;
  opacity: 0;
  cursor: pointer;
  border-radius: 1px;
  z-index: 999;
  
  animation: ${props => props.firstUpdate && !props.openBox ? '' : props.openBox ? 'vessel-track-depth-selection-button-opening' : 'vessel-track-depth-selection-button-closing'} 0.5s ease forwards,
  ${props => props.rightMenuIsOpen && props.openBox ? 'vessel-box-opening-with-right-menu-hover' : 'vessel-box-closing-with-right-menu-hover'} 0.3s ease forwards;

  @keyframes vessel-track-depth-selection-button-opening {
    0%   { margin-right: -45px; opacity: 0;   }
    100% { margin-right: 505px; opacity: 1; }
  }

  @keyframes vessel-track-depth-selection-button-closing {
    0% { margin-right: 505px; opacity: 1; }
    100%   { margin-right: -45px; opacity: 0;   }
  }
`

const TrackDepthSelectionContent = styled(MapComponentStyle)`
  top: 118px;
  width: 282px;
  background: ${COLORS.background};
  position: absolute;
  right: 10px;
  margin-right: ${props => !props.firstUpdate && props.openBox && props.trackDepthSelectionIsOpen ? '540px' : '217px'};
  opacity: ${props => !props.firstUpdate && props.openBox && props.trackDepthSelectionIsOpen ? '1' : '0'};
  visibility: ${props => !props.firstUpdate && props.openBox && props.trackDepthSelectionIsOpen ? 'visible' : 'hidden'};
  border-radius: 2px;
  font-size: 13px;
  color: ${COLORS.slateGray};
  transition: all 0.3s;

  animation: ${props => props.rightMenuIsOpen && props.openBox && props.trackDepthSelectionIsOpen ? 'vessel-box-opening-with-right-menu-hover' : 'vessel-box-closing-with-right-menu-hover'} 0.3s ease forwards;

  @keyframes vessel-track-depth-selection-opening {
    0%   { margin-right: 217px; opacity: 0; visibility: hidden; }
    100% { margin-right: 540px; opacity: 1; visibility: visible; }
  }

  @keyframes vessel-track-depth-selection-closing {
    0% { margin-right: 540px; opacity: 1; visibility: visible; }
    100%   { margin-right: 217px; opacity: 0; visibility: hidden;   }
  }
`

const ClockIcon = styled(VesselSVG)`
  width: 20px;
  background: none;
  margin-top: 2px;
  margin-left: 2px;
`

export default TrackDepthSelection
