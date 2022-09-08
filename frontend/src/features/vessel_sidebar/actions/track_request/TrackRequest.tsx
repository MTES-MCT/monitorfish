import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { getTrackRequestFromTrackDepth, VesselTrackDepth } from '../../../../domain/entities/vesselTrackDepth'
import modifyVesselTrackDepth from '../../../../domain/use_cases/vessel/modifyVesselTrackDepth'
import { useAppDispatch } from '../../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../../hooks/useAppSelector'
import { DateRangePicker } from '../../../../ui/DateRangePicker'
import { MapComponentStyle } from '../../../commonStyles/MapComponent.style'
import { ReactComponent as VesselSVG } from '../../../icons/Icone_navire.svg'
import { ExportTrack } from './ExportTrack'
import { PositionsTable } from './PositionsTable'
import { TrackDepth } from './TrackDepth'

import type { DateRange } from '../../../../types'

/**
 * @typedef {object} TrackRequestProps
 * @property {boolean} sidebarIsOpen
 */

type TrackRequestProps = {
  isSidebarOpen: boolean
}
export function TrackRequest({ isSidebarOpen }: TrackRequestProps) {
  const dispatch = useAppDispatch()
  const { healthcheckTextWarning } = useAppSelector(state => state.global)
  const { rightMenuIsOpen } = useAppSelector(state => state.global)
  /** @type {{ selectedVesselCustomTrackRequest: VesselNS.TrackRequest }} */
  const { selectedVesselCustomTrackRequest } = useAppSelector(state => state.vessel)
  /** @type {{ selectedVesselIdentity: VesselNS.VesselIdentity }} */
  const { selectedVesselIdentity } = useAppSelector(state => state.vessel)
  const [isOpenedFromClick, setIsOpenedFromClick] = useState(false)

  const isOpen = useMemo(() => isSidebarOpen && isOpenedFromClick, [isSidebarOpen, isOpenedFromClick])

  /** @type {[Date, Date] | undefined} */
  const selectedVesselCustomDateRange = useMemo(
    () =>
      selectedVesselCustomTrackRequest.trackDepth === VesselTrackDepth.CUSTOM
        ? ([
            selectedVesselCustomTrackRequest.afterDateTime,
            selectedVesselCustomTrackRequest.beforeDateTime,
          ] as DateRange)
        : undefined,
    [selectedVesselCustomTrackRequest],
  )

  /**
   * @param {VesselNS.VesselTrackDepthKey} newTrackDepth
   */
  const updateTrackDepth = useCallback(
    newTrackDepth => {
      const trackRequest = getTrackRequestFromTrackDepth(newTrackDepth)

      dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, false) as any)
    },
    [dispatch, selectedVesselIdentity],
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

      dispatch(modifyVesselTrackDepth(selectedVesselIdentity, trackRequest, false, true) as any)
    },
    [dispatch, selectedVesselIdentity, updateTrackDepth],
  )

  return (
    <>
      <TrackRequestButton
        data-cy="vessel-track-depth-selection"
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={isOpen}
        isRightMenuOpen={rightMenuIsOpen}
        isSidebarOpen={isSidebarOpen}
        onClick={() => setIsOpenedFromClick(!isOpenedFromClick)}
        title={"Paramétrer l'affichage de la piste VMS"}
      >
        <VesselIcon />
      </TrackRequestButton>
      <TrackRequestBody
        healthcheckTextWarning={healthcheckTextWarning}
        isOpen={isOpen}
        isRightMenuOpen={rightMenuIsOpen}
        isSidebarOpen={isSidebarOpen}
      >
        <Header>Paramétrer l&apos;affichage de la piste VMS</Header>
        <Section>
          <p>Afficher la piste VMS du navire depuis :</p>
          <Field>
            <TrackDepth onChange={updateTrackDepth} value={selectedVesselCustomTrackRequest.trackDepth} />
          </Field>
          <Field>
            <DateRangePicker defaultValue={selectedVesselCustomDateRange} onChange={updateDateRange} withTime />
          </Field>
          <ExportTrack />
        </Section>
        <Header>Liste des positions VMS affichées</Header>
        <PositionsTable openBox />
      </TrackRequestBody>
    </>
  )
}

const Section = styled.div`
  padding: 1rem;

  > p {
    margin: 0 0 0.5rem;
  }
`

const Header = styled.div`
  background: ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gainsboro};
  font-size: 13px;
  padding: 5px 0 5px 15px;
  text-align: left;
`

const Field = styled.div`
  margin-bottom: 1rem;
`

const TrackRequestButton = styled(MapComponentStyle)<{
  isOpen: boolean
  isRightMenuOpen: boolean
  isSidebarOpen: boolean
}>`
  background: ${p => (p.isOpen ? p.theme.color.shadowBlue : p.theme.color.charcoal)};
  border-radius: 1px;
  cursor: pointer;
  height: 30px;
  margin-right: ${p => (p.isSidebarOpen ? 505 : -45)}px;
  right: ${p => (p.isRightMenuOpen && p.isSidebarOpen ? 55 : 10)}px;
  opacity: ${p => (p.isSidebarOpen ? 1 : 0)};
  position: absolute;
  top: 153px;
  transition: all 0.5s, right 0.3s;
  width: 30px;
  z-index: 999;
`

const TrackRequestBody = styled(MapComponentStyle)<{
  isOpen: boolean
  isRightMenuOpen: boolean
  isSidebarOpen: boolean
}>`
  background: ${p => p.theme.color.background};
  border-radius: 2px;
  color: ${p => p.theme.color.slateGray};
  display: flex;
  flex-direction: column;
  font-size: 13px;
  text-align: left;
  margin-right: ${p => (p.isOpen ? '540px' : '217px')};
  opacity: ${p => (p.isOpen ? '1' : '0')};
  position: absolute;
  right: ${p => (p.isRightMenuOpen && p.isSidebarOpen ? 55 : 10)}px;
  top: 118px;
  transition: all 0.3s;
  visibility: ${p => (p.isOpen ? 'visible' : 'hidden')};
  width: 379px;
`

const VesselIcon = styled(VesselSVG)`
  background: none;
  margin-left: 2px;
  margin-top: 2px;
  width: 20px;
`
