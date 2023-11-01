import { DateRangePicker, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { DateRangeRadio } from './DateRangeRadio'
import { ExportTrack } from './ExportTrack'
import { PositionsTable } from './PositionsTable'
import { VesselTrackDepth, getTrackRequestFromTrackDepth } from '../../../../domain/entities/vesselTrackDepth'
import { updateSelectedVesselTrackRequest } from '../../../../domain/use_cases/vessel/updateSelectedVesselTrackRequest'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { MapComponent } from '../../../commonStyles/MapComponent'
import { ReactComponent as VesselSVG } from '../../../icons/Icone_navire.svg'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

import type { TrackRequestCustom, TrackRequestPredefined } from '../../../../domain/entities/vessel/types'
import type { DateRange } from '@mtes-mct/monitor-ui'

type TrackRequestProps = {
  isSidebarOpen: boolean
}
export function TrackRequest({ isSidebarOpen }: TrackRequestProps) {
  const dispatch = useMainAppDispatch()
  const { rightMenuIsOpen } = useMainAppSelector(state => state.global)
  const { defaultVesselTrackDepth } = useMainAppSelector(state => state.map)
  const { selectedVesselTrackRequest } = useMainAppSelector(state => state.vessel)
  const { selectedVesselIdentity } = useMainAppSelector(state => state.vessel)
  const [isOpenedFromClick, setIsOpenedFromClick] = useState(false)

  const dateRangePickerDefaultValue = useMemo(
    () =>
      selectedVesselTrackRequest && selectedVesselTrackRequest.trackDepth === VesselTrackDepth.CUSTOM
        ? ([selectedVesselTrackRequest.afterDateTime, selectedVesselTrackRequest.beforeDateTime] as DateRange)
        : undefined,
    [selectedVesselTrackRequest]
  )
  const isOpen = useMemo(() => isSidebarOpen && isOpenedFromClick, [isSidebarOpen, isOpenedFromClick])

  const handleDateRangeRadioChange = useCallback(
    (nextTrackDepth: Exclude<VesselTrackDepth, VesselTrackDepth.CUSTOM>) => {
      if (!selectedVesselIdentity) {
        return
      }

      const trackRequest: TrackRequestPredefined = {
        afterDateTime: null,
        beforeDateTime: null,
        trackDepth: nextTrackDepth
      }

      dispatch(updateSelectedVesselTrackRequest(selectedVesselIdentity, trackRequest))
    },
    [dispatch, selectedVesselIdentity]
  )

  const handleDateRangePickerChange = useCallback(
    (dateRange: DateRange | undefined) => {
      if (!selectedVesselIdentity) {
        return
      }

      if (!dateRange) {
        const trackRequest = getTrackRequestFromTrackDepth(VesselTrackDepth.TWELVE_HOURS)

        dispatch(updateSelectedVesselTrackRequest(selectedVesselIdentity, trackRequest))

        return
      }

      const [startDate, endDate] = dateRange
      const trackRequest: TrackRequestCustom = {
        afterDateTime: startDate,
        beforeDateTime: endDate,
        trackDepth: VesselTrackDepth.CUSTOM
      }

      dispatch(updateSelectedVesselTrackRequest(selectedVesselIdentity, trackRequest))
    },
    [dispatch, selectedVesselIdentity]
  )

  return (
    <>
      <VesselSidebarActionButton
        backgroundColor={isOpen ? THEME.color.blueGray : THEME.color.charcoal}
        data-cy="vessel-track-depth-selection"
        isRightMenuOpen={rightMenuIsOpen}
        isSidebarOpen={isSidebarOpen}
        onClick={() => setIsOpenedFromClick(!isOpenedFromClick)}
        title={"Paramétrer l'affichage de la piste VMS"}
        top={118}
      >
        <VesselIcon />
      </VesselSidebarActionButton>
      <TrackRequestBody isOpen={isOpen} isRightMenuOpen={rightMenuIsOpen} isSidebarOpen={isSidebarOpen}>
        <Header>Paramétrer l&apos;affichage de la piste VMS</Header>
        <Section>
          <p>Afficher la piste VMS du navire depuis :</p>
          <Field>
            <DateRangeRadio
              defaultValue={selectedVesselTrackRequest?.trackDepth || defaultVesselTrackDepth}
              onChange={handleDateRangeRadioChange}
            />
          </Field>
          <Field>
            <DateRangePicker
              key={selectedVesselTrackRequest?.trackDepth}
              defaultValue={dateRangePickerDefaultValue}
              isCompact
              isHistorical
              isLabelHidden
              label="Plage de temps sur mesure"
              onChange={handleDateRangePickerChange}
              withTime
            />
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

const TrackRequestBody = styled(MapComponent)<{
  isOpen: boolean
  isRightMenuOpen: boolean
  isSidebarOpen: boolean
}>`
  background: ${p => p.theme.color.white};
  border-radius: 2px;
  color: ${p => p.theme.color.slateGray};
  display: flex;
  flex-direction: column;
  font-size: 13px;
  margin-right: ${p => (p.isOpen ? '540px' : '217px')};
  opacity: ${p => (p.isOpen ? '1' : '0')};
  position: absolute;
  right: ${p => (p.isRightMenuOpen && p.isSidebarOpen ? 55 : 10)}px;
  text-align: left;
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
