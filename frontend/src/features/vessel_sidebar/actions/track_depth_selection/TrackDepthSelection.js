import React, { useEffect, useRef, useState } from 'react'
import TrackDepthRadio from './TrackDepthRadio'
import TrackDepthDateRange from './TrackDepthDateRange'
import { COLORS } from '../../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as VesselSVG } from '../../../icons/Icone_navire.svg'
import { VesselTrackDepth } from '../../../../domain/entities/vesselTrackDepth'
import { useDispatch, useSelector } from 'react-redux'
import { MapComponentStyle } from '../../../commonStyles/MapComponent.style'
import TrackPositionsTable from './TrackPositionsTable'
import { setSelectedVesselCustomTrackDepth } from '../../../../domain/shared_slices/Vessel'
import modifyVesselTrackDepth from '../../../../domain/use_cases/modifyVesselTrackDepth'
import { convertToUTCDay } from '../../../../utils'

const TrackDepthSelection = props => {
  const dispatch = useDispatch()

  const { healthcheckTextWarning } = useSelector(state => state.global)
  const { selectedVesselIdentity } = useSelector(state => state.vessel)
  const defaultVesselTrackDepth = useSelector(state => state.map.defaultVesselTrackDepth)

  const [datesSelection, setDateSelection] = useState([])
  const [trackDepthRadioSelection, setTrackDepthRadioSelection] = useState(null)
  const firstUpdate = useRef(true)

  useEffect(() => {
    setDateSelection([])
    setTrackDepthRadioSelection(defaultVesselTrackDepth)
  }, [selectedVesselIdentity])

  useEffect(() => {
    setDateSelection([])
    setTrackDepthRadioSelection(defaultVesselTrackDepth)
  }, [props.init])

  useEffect(() => {
    if (defaultVesselTrackDepth && !trackDepthRadioSelection) {
      setTrackDepthRadioSelection(defaultVesselTrackDepth)
    }
  }, [defaultVesselTrackDepth])

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
      setTrackDepthRadioSelection(defaultVesselTrackDepth)
    }
  }, [datesSelection])

  const showVesselTrackWithTrackDepth = (trackDepth, afterDateTime, beforeDateTime) => {
    const trackDepthObject = {
      trackDepth: trackDepth,
      afterDateTime: afterDateTime,
      beforeDateTime: beforeDateTime
    }

    dispatch(setSelectedVesselCustomTrackDepth(trackDepthObject))
    if (selectedVesselIdentity && trackDepth) {
      dispatch(modifyVesselTrackDepth(
        selectedVesselIdentity,
        trackDepthObject))
    }
  }

  return (
    <>
      <TrackDepthSelectionButton
        healthcheckTextWarning={healthcheckTextWarning}
        openBox={props.openBox}
        rightMenuIsOpen={props.rightMenuIsOpen}
        trackDepthSelectionIsOpen={props.trackDepthSelectionIsOpen}
        onClick={() => props.setTrackDepthSelectionIsOpen(!props.trackDepthSelectionIsOpen)}
        data-cy={'vessel-track-depth-selection'}
        title={'Paramétrer l\'affichage de la piste VMS'}
      >
        <VesselIcon/>
      </TrackDepthSelectionButton>
      <TrackDepthSelectionContent
        healthcheckTextWarning={healthcheckTextWarning}
        openBox={props.openBox}
        rightMenuIsOpen={props.rightMenuIsOpen}
        trackDepthSelectionIsOpen={props.trackDepthSelectionIsOpen}
      >
        <Header>Paramétrer l&apos;affichage de la piste VMS</Header>
        <TrackDepthRadio
          vesselTrackDepth={defaultVesselTrackDepth}
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
  margin-right: ${props => props.openBox ? 505 : -45}px;
  opacity: ${props => props.openBox ? 1 : 0};
  cursor: pointer;
  border-radius: 1px;
  z-index: 999;
  transition: 0.5s all;
  
  animation: ${props => props.rightMenuIsOpen && props.openBox
  ? 'vessel-box-opening-with-right-menu-hover'
  : 'vessel-box-closing-with-right-menu-hover'} 0.3s ease forwards;
`

const TrackDepthSelectionContent = styled(MapComponentStyle)`
  top: 118px;
  width: 306px;
  background: ${COLORS.background};
  position: absolute;
  right: 10px;
  margin-right: ${props => props.openBox && props.trackDepthSelectionIsOpen ? '540px' : '217px'};
  opacity: ${props => props.openBox && props.trackDepthSelectionIsOpen ? '1' : '0'};
  visibility: ${props => props.openBox && props.trackDepthSelectionIsOpen ? 'visible' : 'hidden'};
  border-radius: 2px;
  font-size: 13px;
  color: ${COLORS.slateGray};
  transition: all 0.3s;

  animation: ${props => props.rightMenuIsOpen && props.openBox && props.trackDepthSelectionIsOpen
  ? 'vessel-box-opening-with-right-menu-hover'
  : 'vessel-box-closing-with-right-menu-hover'} 0.3s ease forwards;
`

const VesselIcon = styled(VesselSVG)`
  width: 20px;
  background: none;
  margin-top: 2px;
  margin-left: 2px;
`

export default TrackDepthSelection
