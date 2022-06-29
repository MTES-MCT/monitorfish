import React, { useCallback, useState } from 'react'
import TrackDepth from './TrackDepth'
import DateRange from './DateRange'
import { COLORS } from '../../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as VesselSVG } from '../../../icons/Icone_navire.svg'
import {
  getTrackRequestFromTrackDepth,
  VesselTrackDepth
} from '../../../../domain/entities/vesselTrackDepth'
import { useDispatch, useSelector } from 'react-redux'
import { MapComponentStyle } from '../../../commonStyles/MapComponent.style'
import PositionsTable from './PositionsTable'
import modifyVesselTrackDepth from '../../../../domain/use_cases/vessel/modifyVesselTrackDepth'

const TrackRequest = ({ sidebarIsOpen, rightMenuIsOpen, trackRequestIsOpen, setTrackRequestIsOpen }) => {
  const dispatch = useDispatch()

  const { healthcheckTextWarning } = useSelector(state => state.global)
  const { defaultVesselTrackDepth } = useSelector(state => state.map)
  /** @type {[string, *]} */
  const [selectedTrackDepth, setSelectedTrackDepth] = useState(defaultVesselTrackDepth)
  /** @type {[[Date, Date], *]} */
  const [selectedDates, setSelectedDates] = useState()
  const { selectedVesselIdentity } = useSelector(state => state.vessel)

  /**
   * @param {[Date, Date]} dateRange
   */
  const updateDateRange = useCallback(([startDate, endDate]) => {
    const trackRequest = {
      trackDepth: VesselTrackDepth.CUSTOM,
      afterDateTime: startDate,
      beforeDateTime: endDate
    }

    dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, false))

    setSelectedDates([startDate, endDate])
    setSelectedTrackDepth(undefined)
  }, [selectedVesselIdentity])

  const updateTrackDepth = useCallback((trackDepthRadioSelection) => {
    const trackRequest = getTrackRequestFromTrackDepth(trackDepthRadioSelection)

    dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, false))

    setSelectedDates(undefined)
    setSelectedTrackDepth(trackRequest.trackDepth)
  }, [selectedVesselIdentity])

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
                modifyVesselTrackDepth={updateTrackDepth}
              />
              <DateRange
                defaultValue={selectedDates}
                isDisabledAfterToday
                onChange={updateDateRange}
                placeholder={'Choisir une période précise'}
              />
              <Header>Liste des positions VMS affichées</Header>
              <PositionsTable
                openBox={sidebarIsOpen}
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
  right: 10px;
  margin-right: ${props => props.sidebarIsOpen ? 505 : -45}px;
  opacity: ${props => props.sidebarIsOpen ? 1 : 0};
  cursor: pointer;
  border-radius: 1px;
  z-index: 999;
  right: ${props => props.rightMenuIsOpen && props.sidebarIsOpen ? 55 : 10}px;
  transition: all 0.5s, right 0.3s;
`

const TrackRequestBody = styled(MapComponentStyle)`
  top: 118px;
  width: 306px;
  background: ${COLORS.background};
  position: absolute;
  right: 10px;
  margin-right: ${props => props.sidebarIsOpen && props.trackRequestIsOpen ? '540px' : '217px'};
  opacity: ${props => props.sidebarIsOpen && props.trackRequestIsOpen ? '1' : '0'};
  visibility: ${props => props.sidebarIsOpen && props.trackRequestIsOpen ? 'visible' : 'hidden'};
  border-radius: 2px;
  font-size: 13px;
  color: ${COLORS.slateGray};
  transition: all 0.3s;

  animation: ${props => props.rightMenuIsOpen && props.sidebarIsOpen && props.trackRequestIsOpen
  ? 'vessel-box-opening-with-right-menu-hover'
  : 'vessel-box-closing-with-right-menu-hover'} 0.3s ease forwards;
`

const VesselIcon = styled(VesselSVG)`
  width: 20px;
  background: none;
  margin-top: 2px;
  margin-left: 2px;
`

export default TrackRequest
