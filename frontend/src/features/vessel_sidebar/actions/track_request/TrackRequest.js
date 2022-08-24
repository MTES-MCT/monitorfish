import { useCallback, useMemo, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { getTrackRequestFromTrackDepth, VesselTrackDepth } from '../../../../domain/entities/vesselTrackDepth'
import modifyVesselTrackDepth from '../../../../domain/use_cases/vessel/modifyVesselTrackDepth'
import { MapComponentStyle } from '../../../commonStyles/MapComponent.style'
import { ReactComponent as VesselSVG } from '../../../icons/Icone_navire.svg'
import DateRange from './DateRange'
import ExportTrack from './ExportTrack'
import PositionsTable from './PositionsTable'
import TrackDepth from './TrackDepth'

/**
 * @typedef {object} TrackRequestProps
 * @property {boolean} sidebarIsOpen
 */

/**
 * @param {TrackRequestProps} props
 */
function TrackRequest({ sidebarIsOpen }) {
  const dispatch = useDispatch()
  /** @type {{ healthcheckTextWarning: string }} */
  const { healthcheckTextWarning } = useSelector(state => state.global)
  /** @type {{ rightMenuIsOpen: boolean }} */
  const { rightMenuIsOpen } = useSelector(state => state.global)
  /** @type {{ selectedVesselCustomTrackRequest: VesselNS.TrackRequest }} */
  const { selectedVesselCustomTrackRequest } = useSelector(state => state.vessel)
  /** @type {{ selectedVesselIdentity: VesselNS.VesselIdentity }} */
  const { selectedVesselIdentity } = useSelector(state => state.vessel)
  const [isOpenedFromClick, setIsOpenedFromClick] = useState(false)

  const isOpen = useMemo(() => sidebarIsOpen && isOpenedFromClick, [sidebarIsOpen, isOpenedFromClick])

  /** @type {[Date, Date] | undefined} */
  const selectedVesselCustomDateRange = useMemo(
    () =>
      selectedVesselCustomTrackRequest.trackDepth === VesselTrackDepth.CUSTOM
        ? [selectedVesselCustomTrackRequest.afterDateTime, selectedVesselCustomTrackRequest.beforeDateTime]
        : undefined,
    [selectedVesselCustomTrackRequest],
  )

  /**
   * @param {[Date, Date]} dateRange
   */
  const updateDateRange = useCallback(
    dateRange => {
      if (!dateRange) {
        updateTrackDepth(VesselTrackDepth.TWELVE_HOURS)

        return
      }

      const [startDate, endDate] = dateRange
      /** @type {VesselNS.TrackRequestCustom} */
      const trackRequest = {
        afterDateTime: startDate,
        beforeDateTime: endDate,
        trackDepth: VesselTrackDepth.CUSTOM,
      }

      dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, true))
    },
    [dispatch, selectedVesselIdentity],
  )

  /**
   * @param {VesselNS.VesselTrackDepthKey} newTrackDepth
   */
  const updateTrackDepth = useCallback(
    newTrackDepth => {
      const trackRequest = getTrackRequestFromTrackDepth(newTrackDepth)

      dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, false))
    },
    [dispatch, selectedVesselIdentity],
  )

  return (
    <>
      <TrackRequestButton
        data-cy="vessel-track-depth-selection"
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={isOpen}
        isRightMenuOpen={rightMenuIsOpen}
        onClick={() => setIsOpenedFromClick(!isOpenedFromClick)}
        sidebarIsOpen={sidebarIsOpen}
        title={"Paramétrer l'affichage de la piste VMS"}
      >
        <VesselIcon />
      </TrackRequestButton>
      <TrackRequestBody
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={isOpen}
        isRightMenuOpen={rightMenuIsOpen}
        sidebarIsOpen={sidebarIsOpen}
      >
        <Header>Paramétrer l&apos;affichage de la piste VMS</Header>
        <TrackDepth onChange={updateTrackDepth} value={selectedVesselCustomTrackRequest.trackDepth} />
        <DateRange
          defaultValue={selectedVesselCustomDateRange}
          isDisabledAfterToday
          onChange={updateDateRange}
          placeholder="Choisir une période précise"
        />
        <ExportTrack />
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
  background: ${p => (p.isOpen ? COLORS.shadowBlue : COLORS.charcoal)};
  border-radius: 1px;
  cursor: pointer;
  height: 30px;
  margin-right: ${props => (props.sidebarIsOpen ? 505 : -45)}px;
  right: ${props => (props.isRightMenuOpen && props.sidebarIsOpen ? 55 : 10)}px;
  opacity: ${props => (props.sidebarIsOpen ? 1 : 0)};
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
  margin-right: ${p => (p.isOpen ? '540px' : '217px')};
  opacity: ${p => (p.isOpen ? '1' : '0')};
  position: absolute;
  right: ${props => (props.isRightMenuOpen && props.sidebarIsOpen ? 55 : 10)}px;
  top: 118px;
  transition: all 0.3s;
  visibility: ${p => (p.isOpen ? 'visible' : 'hidden')};
  width: 306px;
`

const VesselIcon = styled(VesselSVG)`
  background: none;
  margin-left: 2px;
  margin-top: 2px;
  width: 20px;
`

export default TrackRequest
