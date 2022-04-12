import React, { useEffect, useState } from 'react'
import TrackDepthRadio from './TrackDepthRadio'
import TrackDepthDateRange from './TrackDepthDateRange'
import { COLORS } from '../../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as VesselSVG } from '../../../icons/Icone_navire.svg'
import {
  getTrackRequestFromDates,
  getTrackRequestFromTrackDepth
} from '../../../../domain/entities/vesselTrackDepth'
import { useDispatch, useSelector } from 'react-redux'
import { MapComponentStyle } from '../../../commonStyles/MapComponent.style'
import TrackPositionsTable from './TrackPositionsTable'
import modifyVesselTrackDepth from '../../../../domain/use_cases/vessel/modifyVesselTrackDepth'

const TrackDepthSelection = ({ openBox, rightMenuIsOpen, trackDepthSelectionIsOpen, setTrackDepthSelectionIsOpen }) => {
  const dispatch = useDispatch()

  const { healthcheckTextWarning } = useSelector(state => state.global)
  const { defaultVesselTrackDepth } = useSelector(state => state.map)
  const [selectedTrackDepthRadio, setSelectedTrackDepthRadio] = useState(null)
  const [selectedTrackDepthDates, setSelectedTrackDepthDates] = useState([])
  const {
    selectedVesselIdentity,
    selectedVesselCustomTrackRequest
  } = useSelector(state => state.vessel)

  useEffect(() => {
    const { afterDateTime, beforeDateTime, trackDepth } = selectedVesselCustomTrackRequest
    if (afterDateTime && beforeDateTime) {
      setSelectedTrackDepthRadio(null)
    } else {
      setSelectedTrackDepthRadio(trackDepth || defaultVesselTrackDepth)
    }
  }, [selectedVesselCustomTrackRequest])

  useEffect(() => {
    const { afterDateTime, beforeDateTime } = selectedVesselCustomTrackRequest
    if (afterDateTime && beforeDateTime) {
      setSelectedTrackDepthDates([afterDateTime, beforeDateTime])
    } else {
      setSelectedTrackDepthDates([])
    }
  }, [selectedVesselCustomTrackRequest])

  const triggerModifyVesselTrackDepthFromRadio = trackDepthRadioSelection => {
    const trackRequest = getTrackRequestFromTrackDepth(trackDepthRadioSelection)
    dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, false))
  }

  const triggerModifyVesselTrackDepthFromDates = trackDepthDatesSelection => {
    if (trackDepthDatesSelection?.length > 1) {
      const trackRequest = getTrackRequestFromDates(trackDepthDatesSelection[0], trackDepthDatesSelection[1])
      dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, true))
    }
  }

  const resetToDefaultTrackDepth = () => triggerModifyVesselTrackDepthFromRadio(defaultVesselTrackDepth)

  return (
    <>
      {
        openBox
          ? <>
            <TrackDepthSelectionButton
              healthcheckTextWarning={healthcheckTextWarning}
              openBox={openBox}
              rightMenuIsOpen={rightMenuIsOpen}
              trackDepthSelectionIsOpen={trackDepthSelectionIsOpen}
              onClick={() => setTrackDepthSelectionIsOpen(!trackDepthSelectionIsOpen)}
              data-cy={'vessel-track-depth-selection'}
              title={'Paramétrer l\'affichage de la piste VMS'}
            >
              <VesselIcon/>
            </TrackDepthSelectionButton>
            <TrackDepthSelectionContent
              healthcheckTextWarning={healthcheckTextWarning}
              openBox={openBox}
              rightMenuIsOpen={rightMenuIsOpen}
              trackDepthSelectionIsOpen={trackDepthSelectionIsOpen}
            >
              <Header>Paramétrer l&apos;affichage de la piste VMS</Header>
              <TrackDepthRadio
                trackDepthRadioSelection={selectedTrackDepthRadio}
                modifyVesselTrackDepth={triggerModifyVesselTrackDepthFromRadio}
              />
              <TrackDepthDateRange
                dates={selectedTrackDepthDates}
                resetToDefaultTrackDepth={resetToDefaultTrackDepth}
                modifyVesselTrackDepthFromDates={triggerModifyVesselTrackDepthFromDates}
              />
              <Header>Liste des positions VMS affichées</Header>
              <TrackPositionsTable
                openBox={openBox}
              />
            </TrackDepthSelectionContent>
          </>
          : null
      }
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
  top: 153px;
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
