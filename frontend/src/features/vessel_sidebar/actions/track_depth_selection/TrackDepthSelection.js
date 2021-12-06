import React, { useEffect, useState } from 'react'
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
import { usePrevious } from '../../../../hooks/usePrevious'

const TrackDepthSelection = props => {
  const dispatch = useDispatch()

  const { healthcheckTextWarning } = useSelector(state => state.global)
  const {
    selectedVesselIdentity,
    selectedVesselCustomTrackDepth
  } = useSelector(state => state.vessel)
  const defaultVesselTrackDepth = useSelector(state => state.map.defaultVesselTrackDepth)

  const [datesSelection, setDateSelection] = useState([])
  const [updateTrackDepthFromDates, setUpdateTrackDepthFromDates] = useState(false)
  const [trackDepthRadioSelection, setTrackDepthRadioSelection] = useState(null)
  const previousTrackDepthRadioSelection = usePrevious(trackDepthRadioSelection)

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
    const {
      afterDateTime,
      beforeDateTime,
      trackDepth
    } = selectedVesselCustomTrackDepth

    if (afterDateTime && beforeDateTime &&
      (!datesSelection?.length ||
        (datesSelection?.length && (datesSelection[0].getTime() !== afterDateTime.getTime() || datesSelection[1].getTime() !== beforeDateTime.getTime())))) {
      setDateSelection([afterDateTime, beforeDateTime])
      setUpdateTrackDepthFromDates(false)
      setTrackDepthRadioSelection(null)
      return
    }

    if (trackDepth && trackDepth !== trackDepthRadioSelection) {
      setTrackDepthRadioSelection(trackDepth)
    }
  }, [selectedVesselCustomTrackDepth])

  useEffect(() => {
    if (trackDepthRadioSelection && trackDepthRadioSelection !== previousTrackDepthRadioSelection) {
      const nextTrackDepth = {
        trackDepth: trackDepthRadioSelection,
        beforeDatetime: null,
        afterDatetime: null
      }
      dispatch(setSelectedVesselCustomTrackDepth(nextTrackDepth))
      dispatch(modifyVesselTrackDepth(selectedVesselIdentity, nextTrackDepth))
      setDateSelection([])
    }
  }, [trackDepthRadioSelection])

  const setDatesFromDateRangePicker = dates => {
    setDateSelection(dates)
    setUpdateTrackDepthFromDates(true)
  }

  useEffect(() => {
    if (datesSelection?.length > 1) {
      if (updateTrackDepthFromDates) {
        const vesselTrackDepth = {
          trackDepth: VesselTrackDepth.CUSTOM,
          afterDateTime: datesSelection[0],
          beforeDateTime: datesSelection[1]
        }
        dispatch(setSelectedVesselCustomTrackDepth(vesselTrackDepth))
        dispatch(modifyVesselTrackDepth(selectedVesselIdentity, vesselTrackDepth, false, true))
        setUpdateTrackDepthFromDates(false)
      }
      setTrackDepthRadioSelection(null)
    } else if (!trackDepthRadioSelection) {
      setTrackDepthRadioSelection(defaultVesselTrackDepth)
    }
  }, [datesSelection, updateTrackDepthFromDates])

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
          trackDepthRadioSelection={trackDepthRadioSelection}
          setTrackDepthRadioSelection={setTrackDepthRadioSelection}
        />
        <TrackDepthDateRange
          dates={datesSelection}
          setDate={setDatesFromDateRangePicker}
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
  right: ${props => props.rightMenuIsOpen && props.openBox ? 55 : 10}px;
  transition: all 0.5s, right 0.3s;
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
