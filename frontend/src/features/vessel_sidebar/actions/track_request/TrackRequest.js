import { useCallback, useMemo, useState, useEffect } from 'react'
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
import ExportTrack from './ExportTrack'

/**
 * @typedef {object} TrackRequestProps
 * @property {boolean} sidebarIsOpen
 */

/**
 * @param {TrackRequestProps} props
 */
const TrackRequest = ({ sidebarIsOpen }) => {
  const dispatch = useDispatch()
  /** @type {{ healthcheckTextWarning: string }} */
  const { healthcheckTextWarning } = useSelector(state => state.global)
  /** @type {{ rightMenuIsOpen: boolean }} */
  const { rightMenuIsOpen } = useSelector(state => state.global)
  /** @type {{ selectedVesselCustomTrackRequest: VesselNS.TrackRequest }} */
  const { selectedVesselCustomTrackRequest } = useSelector(state => state.vessel)
  /** @type {{ selectedVesselIdentity: VesselNS.VesselIdentity }} */
  const { selectedVesselIdentity } = useSelector(state => state.vessel)
  const [isTrackRequestOpen, setIsTrackRequestOpen] = useState(false)

  /** @type {[Date, Date] | undefined} */
  const selectedVesselCustomDateRange = useMemo(
    () => selectedVesselCustomTrackRequest.trackDepth === VesselTrackDepth.CUSTOM
      ? [selectedVesselCustomTrackRequest.afterDateTime, selectedVesselCustomTrackRequest.beforeDateTime]
      : undefined,
    [selectedVesselCustomTrackRequest]
  )

  useEffect(() => {
    if (!sidebarIsOpen) {
      setIsTrackRequestOpen(false)
    }
  }, [sidebarIsOpen])

  /**
   * @param {[Date, Date]} dateRange
   */
  const updateDateRange = useCallback((dateRange) => {
    if (!dateRange) {
      updateTrackDepth(VesselTrackDepth.TWELVE_HOURS)

      return
    }

    const [startDate, endDate] = dateRange
    /** @type {VesselNS.TrackRequestCustom} */
    const trackRequest = {
      trackDepth: VesselTrackDepth.CUSTOM,
      afterDateTime: startDate,
      beforeDateTime: endDate
    }

    dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, true))
  }, [dispatch, selectedVesselIdentity])

  /**
   * @param {VesselNS.VesselTrackDepthKey} newTrackDepth
   */
  const updateTrackDepth = useCallback((newTrackDepth) => {
    const trackRequest = getTrackRequestFromTrackDepth(newTrackDepth)

    dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, false))
  }, [dispatch, selectedVesselIdentity])

  return (
    <>
      <TrackRequestButton
        healthcheckTextWarning={healthcheckTextWarning}
        data-cy={'vessel-track-depth-selection'}
        sidebarIsOpen={sidebarIsOpen}
        isRightMenuOpen={rightMenuIsOpen}
        isTrackRequestOpen={isTrackRequestOpen}
        onClick={() => setIsTrackRequestOpen(!isTrackRequestOpen)}
        title={'Paramétrer l\'affichage de la piste VMS'}
      >
        <VesselIcon/>
      </TrackRequestButton>
      <TrackRequestBody
        healthcheckTextWarning={healthcheckTextWarning}
        sidebarIsOpen={sidebarIsOpen}
        isRightMenuOpen={rightMenuIsOpen}
        isTrackRequestOpen={isTrackRequestOpen}
      >
        <Header>Paramétrer l&apos;affichage de la piste VMS</Header>
        <TrackDepth
          onChange={updateTrackDepth}
          value={selectedVesselCustomTrackRequest.trackDepth}
        />
        <DateRange
          defaultValue={selectedVesselCustomDateRange}
          isDisabledAfterToday
          onChange={updateDateRange}
          placeholder={'Choisir une période précise'}
        />
        <ExportTrack/>
        <Header>Liste des positions VMS affichées</Header>
        <PositionsTable openBox />
      </TrackRequestBody>
    </>
  )
}

const Header = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  font-size: 13px;
  padding: 5px 0 5px 15px;
  text-align: left;
`

const TrackRequestButton = styled(MapComponentStyle)`
  background: ${p => p.isTrackRequestOpen ? COLORS.shadowBlue : COLORS.charcoal};
  border-radius: 1px;
  cursor: pointer;
  height: 30px;
  margin-right: ${props => props.sidebarIsOpen ? 505 : -45}px;
  right: ${props => props.isRightMenuOpen && props.sidebarIsOpen ? 55 : 10}px;
  opacity: ${props => props.sidebarIsOpen ? 1 : 0};
  position: absolute;
  top: 153px;
  transition: all 0.5s, right 0.3s;
  width: 30px;
  z-index: 999;
`

const TrackRequestBody = styled(MapComponentStyle)`
  background: ${COLORS.background};
  border-radius: 2px;
  color: ${COLORS.slateGray};
  font-size: 13px;
  text-align: left;
  margin-right: ${p => p.isTrackRequestOpen ? '540px' : '217px'};
  opacity: ${p => p.isTrackRequestOpen ? '1' : '0'};
  position: absolute;
  right: ${props => props.isRightMenuOpen && props.sidebarIsOpen ? 55 : 10}px;
  top: 118px;
  transition: all 0.3s;
  visibility: ${p => p.isTrackRequestOpen ? 'visible' : 'hidden'};
  width: 306px;
`

const VesselIcon = styled(VesselSVG)`
  background: none;
  margin-left: 2px;
  margin-top: 2px;
  width: 20px;
`

export default TrackRequest
