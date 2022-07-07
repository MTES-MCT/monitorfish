import { useCallback, useMemo } from 'react'
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

/**
 * @typedef {object} TrackRequestProps
 * @property {boolean} isRightMenuOpen
 * @property {boolean} isTrackRequestOpen
 * @property {(isOpen: boolean) => void} setIsTrackRequestOpen
 */

/**
 * @param {TrackRequestProps} props
 */
const TrackRequest = ({ isRightMenuOpen, setIsTrackRequestOpen, isTrackRequestOpen }) => {
  const dispatch = useDispatch()
  /** @type {{ healthcheckTextWarning: string }} */
  const { healthcheckTextWarning } = useSelector(state => state.global)
  /** @type {{ selectedVesselCustomTrackRequest: Vessel.TrackRequest }} */
  const { selectedVesselCustomTrackRequest } = useSelector(state => state.vessel)
  /** @type {{ selectedVesselIdentity: Vessel.VesselIdentity }} */
  const { selectedVesselIdentity } = useSelector(state => state.vessel)

  /** @type {[Date, Date] | undefined} */
  const selectedVesselCustomDateRange = useMemo(
    () => selectedVesselCustomTrackRequest.trackDepth === VesselTrackDepth.CUSTOM
      ? [selectedVesselCustomTrackRequest.afterDateTime, selectedVesselCustomTrackRequest.beforeDateTime]
      : undefined,
    [selectedVesselCustomTrackRequest]
  )

  /**
   * @param {[Date, Date]} dateRange
   */
  const updateDateRange = useCallback((dateRange) => {
    if (!dateRange) {
      updateTrackDepth(VesselTrackDepth.TWELVE_HOURS)

      return
    }

    const [startDate, endDate] = dateRange
    /** @type {Vessel.TrackRequestCustom} */
    const trackRequest = {
      trackDepth: VesselTrackDepth.CUSTOM,
      afterDateTime: startDate,
      beforeDateTime: endDate
    }

    dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, true))
  }, [dispatch, selectedVesselIdentity])

  /**
   * @param {Vessel.VesselTrackDepthKey} newTrackDepth
   */
  const updateTrackDepth = useCallback((newTrackDepth) => {
    const trackRequest = getTrackRequestFromTrackDepth(newTrackDepth)

    dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, false))
  }, [dispatch, selectedVesselIdentity])

  return (
    <>
      <TrackRequestButton
        data-cy={'vessel-track-depth-selection'}
        healthcheckTextWarning={healthcheckTextWarning}
        isRightMenuOpen={isRightMenuOpen}
        isTrackRequestOpen={isTrackRequestOpen}
        onClick={() => setIsTrackRequestOpen(!isTrackRequestOpen)}
        title={'Paramétrer l\'affichage de la piste VMS'}
      >
        <VesselIcon/>
      </TrackRequestButton>
      <TrackRequestBody
        healthcheckTextWarning={healthcheckTextWarning}
        isRightMenuOpen={isRightMenuOpen}
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
  margin-right: 505px;
  opacity: 1;
  position: absolute;
  right: ${p => p.isRightMenuOpen ? 55 : 10}px;
  top: 153px;
  transition: all 0.5s, right 0.3s;
  width: 30px;
  z-index: 999;
`

const TrackRequestBody = styled(MapComponentStyle)`
  animation: ${p => p.isRightMenuOpen && p.isTrackRequestOpen
    ? 'vessel-box-opening-with-right-menu-hover'
    : 'vessel-box-closing-with-right-menu-hover'} 0.3s ease forwards;
  background: ${COLORS.background};
  border-radius: 2px;
  color: ${COLORS.slateGray};
  font-size: 13px;
  margin-right: ${p => p.isTrackRequestOpen ? '540px' : '217px'};
  opacity: ${p => p.isTrackRequestOpen ? '1' : '0'};
  position: absolute;
  right: 10px;
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
