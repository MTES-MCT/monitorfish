import React, { useEffect, useState } from 'react'
import TrackDepth from './TrackDepth'
import DateRange from './DateRange'
import { COLORS } from '../../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as VesselSVG } from '../../../icons/Icone_navire.svg'
import {
  getTrackRequestFromDates,
  getTrackRequestFromTrackDepth
} from '../../../../domain/entities/vesselTrackDepth'
import { useDispatch, useSelector } from 'react-redux'
import { MapComponentStyle } from '../../../commonStyles/MapComponent.style'
import PositionsTable from './PositionsTable'
import modifyVesselTrackDepth from '../../../../domain/use_cases/vessel/modifyVesselTrackDepth'
import ExportTrack from './ExportTrack'

const TrackRequest = ({ sidebarIsOpen }) => {
  const dispatch = useDispatch()

  const {
    healthcheckTextWarning,
    rightMenuIsOpen
  } = useSelector(state => state.global)
  const { defaultVesselTrackDepth } = useSelector(state => state.map)

  const [selectedTrackDepth, setSelectedTrackDepth] = useState(null)
  const [trackRequestIsOpen, setTrackRequestIsOpen] = useState(false)
  const [selectedDates, setSelectedDates] = useState([])
  const {
    selectedVesselIdentity,
    selectedVesselCustomTrackRequest
  } = useSelector(state => state.vessel)

  useEffect(() => {
    if (!sidebarIsOpen) {
      setTrackRequestIsOpen(false)
    }
  }, [sidebarIsOpen])

  useEffect(() => {
    const { afterDateTime, beforeDateTime, trackDepth } = selectedVesselCustomTrackRequest
    if (afterDateTime && beforeDateTime) {
      setSelectedTrackDepth(null)
    } else {
      setSelectedTrackDepth(trackDepth || defaultVesselTrackDepth)
    }
  }, [selectedVesselCustomTrackRequest])

  useEffect(() => {
    const { afterDateTime, beforeDateTime } = selectedVesselCustomTrackRequest
    if (afterDateTime && beforeDateTime) {
      setSelectedDates([afterDateTime, beforeDateTime])
    } else {
      setSelectedDates([])
    }
  }, [selectedVesselCustomTrackRequest])

  const triggerModifyVesselTrackFromTrackDepthRadio = trackDepthRadioSelection => {
    const trackRequest = getTrackRequestFromTrackDepth(trackDepthRadioSelection)
    dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, false))
  }

  const triggerModifyVesselTrackFromDates = trackDepthDatesSelection => {
    if (trackDepthDatesSelection?.length > 1) {
      const trackRequest = getTrackRequestFromDates(trackDepthDatesSelection[0], trackDepthDatesSelection[1])
      dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, true))
    }
  }

  const resetToDefaultTrackDepth = () => triggerModifyVesselTrackFromTrackDepthRadio(defaultVesselTrackDepth)

  return (
    <>
      {
        sidebarIsOpen
          ? <>
            <TrackRequestButton
              healthcheckTextWarning={healthcheckTextWarning}
              sidebarIsOpen={sidebarIsOpen}
              rightMenuIsOpen={rightMenuIsOpen}
              trackRequestIsOpen={trackRequestIsOpen}
              onClick={() => setTrackRequestIsOpen(!trackRequestIsOpen)}
              data-cy={'vessel-track-depth-selection'}
              title={'Paramétrer l\'affichage de la piste VMS'}
            >
              <VesselIcon/>
            </TrackRequestButton>
            <TrackRequestBody
              healthcheckTextWarning={healthcheckTextWarning}
              sidebarIsOpen={sidebarIsOpen}
              rightMenuIsOpen={rightMenuIsOpen}
              trackRequestIsOpen={trackRequestIsOpen}
            >
              <Header>Paramétrer l&apos;affichage de la piste VMS</Header>
              <TrackDepth
                selectedTrackDepth={selectedTrackDepth}
                modifyVesselTrackDepth={triggerModifyVesselTrackFromTrackDepthRadio}
              />
              <DateRange
                disableAfterToday
                placeholder={'Choisir une période précise'}
                dates={selectedDates}
                resetToDefaultTrackDepth={resetToDefaultTrackDepth}
                modifyVesselTrackFromDates={triggerModifyVesselTrackFromDates}
              />
              <ExportTrack/>
              <Header>Liste des positions VMS affichées</Header>
              <PositionsTable
                sidebarIsOpen={sidebarIsOpen}
              />
            </TrackRequestBody>
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

const TrackRequestButton = styled(MapComponentStyle)`
  top: 153px;
  height: 30px;
  width: 30px;
  background: ${props => props.trackRequestIsOpen ? COLORS.shadowBlue : COLORS.charcoal};
  position: absolute;
  margin-right: ${props => props.sidebarIsOpen ? 505 : -45}px;
  right: ${props => props.rightMenuIsOpen && props.sidebarIsOpen ? 55 : 10}px;
  opacity: ${props => props.sidebarIsOpen ? 1 : 0};
  cursor: pointer;
  border-radius: 1px;
  z-index: 999;
  transition: all 0.5s, right 0.3s;
`

const TrackRequestBody = styled(MapComponentStyle)`
  top: 118px;
  width: 306px;
  background: ${COLORS.background};
  position: absolute;
  text-align: left;
  margin-right: ${props => props.sidebarIsOpen && props.trackRequestIsOpen ? '540px' : '217px'};
  right: ${props => props.rightMenuIsOpen && props.sidebarIsOpen ? 55 : 10}px;
  opacity: ${props => props.sidebarIsOpen && props.trackRequestIsOpen ? '1' : '0'};
  visibility: ${props => props.sidebarIsOpen && props.trackRequestIsOpen ? 'visible' : 'hidden'};
  border-radius: 2px;
  font-size: 13px;
  color: ${COLORS.slateGray};
  transition: all 0.3s;
`

const VesselIcon = styled(VesselSVG)`
  width: 20px;
  background: none;
  margin-top: 2px;
  margin-left: 2px;
`

export default TrackRequest
