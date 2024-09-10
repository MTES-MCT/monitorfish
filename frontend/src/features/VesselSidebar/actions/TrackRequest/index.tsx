import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DateRangePicker, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ExportTrack } from './ExportTrack'
import { PositionsTable } from './PositionsTable'
import { TrackDepthSelection } from './TrackDepthSelection'
import { getTrackRequestFromTrackDepth, VesselTrackDepth } from '../../../../domain/entities/vesselTrackDepth'
import { updateSelectedVesselTrackRequest } from '../../../../domain/use_cases/vessel/updateSelectedVesselTrackRequest'
import { MapComponent } from '../../../commonStyles/MapComponent'
import VesselSVG from '../../../icons/Icone_navire.svg?react'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

import type { TrackRequestCustom, TrackRequestPredefined } from '../../../../domain/entities/vessel/types'
import type { SelectableVesselTrackDepth } from '@features/VesselSidebar/actions/TrackRequest/types'
import type { DateRange } from '@mtes-mct/monitor-ui'

type TrackRequestProps = {
  isSidebarOpen: boolean
}
export function TrackRequest({ isSidebarOpen }: TrackRequestProps) {
  const dispatch = useMainAppDispatch()
  const { rightMenuIsOpen } = useMainAppSelector(state => state.mainWindow)
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
    (nextTrackDepth: SelectableVesselTrackDepth | undefined) => {
      if (!selectedVesselIdentity || !nextTrackDepth) {
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
        title="Paramétrer l'affichage de la piste VMS"
        top={118}
      >
        <VesselIcon />
      </VesselSidebarActionButton>
      {isOpen && (
        <TrackRequestBody isRightMenuOpen={rightMenuIsOpen} isSidebarOpen={isSidebarOpen}>
          <Header>Paramétrer l&apos;affichage de la piste VMS</Header>
          <Section>
            <Field>
              <TrackDepthSelection
                defaultValue={selectedVesselTrackRequest?.trackDepth ?? defaultVesselTrackDepth}
                label="Afficher la piste VMS depuis"
                name="vessel-track-depth"
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
                name="dateRange"
                onChange={handleDateRangePickerChange}
                withTime
              />
            </Field>
            <ExportTrack />
          </Section>
          <Header>Liste des positions VMS affichées</Header>
          <PositionsTable openBox />
        </TrackRequestBody>
      )}
    </>
  )
}

const Section = styled.div`
  padding: 16px;

  > p {
    margin: 0 0 8px;
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
  margin-bottom: 16px;

  .rs-picker-popup {
    width: max-content;
  }
`

const TrackRequestBody = styled(MapComponent)<{
  isRightMenuOpen: boolean
  isSidebarOpen: boolean
}>`
  background: ${p => p.theme.color.white};
  border-radius: 2px;
  color: ${p => p.theme.color.slateGray};
  display: flex;
  flex-direction: column;
  font-size: 13px;
  margin-right: 540px;
  position: absolute;
  right: ${p => (p.isRightMenuOpen && p.isSidebarOpen ? 55 : 10)}px;
  text-align: left;
  top: 118px;
  transition: all 0.3s;
  width: 379px;
`

const VesselIcon = styled(VesselSVG)`
  background: none;
  margin-left: 2px;
  margin-top: 2px;
  width: 20px;
`
