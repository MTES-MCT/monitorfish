import { GAP_WITH_MAP_BUTTON } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { selectIsPositionReplayActive, selectPositionsDateTime } from '@features/PositionReplay/selectors'
import { getSelectedTrackDepth, getTrackRequestEndingAt, isTrackDepthAvailable } from '@features/PositionReplay/track'
import { VesselTrackDepth } from '@features/Vessel/types/vesselTrackDepth'
import { updateVesselTrackAndLogbookFromDates } from '@features/Vessel/useCases/updateVesselTrackAndLogbookFromDates'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { DateRangePicker, Icon, THEME } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import { ExportTrack } from './ExportTrack'
import { PositionsTable } from './PositionsTable'
import { TrackDepthSelection } from './TrackDepthSelection'
import { MapComponent } from '../../../../../commonStyles/MapComponent'
import { VesselSidebarActionButton } from '../VesselSidebarActionButton'

import type { SelectableVesselTrackDepth } from '@features/Vessel/components/VesselSidebar/components/TrackRequest/types'
import type { TrackRequestCustom } from '@features/Vessel/types/types'
import type { DateRange } from '@mtes-mct/monitor-ui'

type TrackRequestProps = {
  isSidebarOpen: boolean
}
export function TrackRequest({ isSidebarOpen }: TrackRequestProps) {
  const dispatch = useMainAppDispatch()
  const defaultVesselTrackDepth = useMainAppSelector(state => state.map.defaultVesselTrackDepth)
  const selectedVesselTrackRequest = useMainAppSelector(state => state.vessel.selectedVesselTrackRequest)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const isPositionReplayActive = useMainAppSelector(selectIsPositionReplayActive)
  const positionsDateTime = useMainAppSelector(selectPositionsDateTime)
  const [isOpenedFromClick, setIsOpenedFromClick] = useState(false)

  const dateRangePickerDefaultValue =
    selectedVesselTrackRequest && selectedVesselTrackRequest.trackDepth === VesselTrackDepth.CUSTOM
      ? ([selectedVesselTrackRequest.afterDateTime, selectedVesselTrackRequest.beforeDateTime] as DateRange)
      : undefined
  const selectedTrackDepth = getSelectedTrackDepth(selectedVesselTrackRequest ?? undefined, positionsDateTime)
  const isOpen = isSidebarOpen && isOpenedFromClick

  const handleDateRangeRadioChange = (nextTrackDepth: SelectableVesselTrackDepth | undefined) => {
    if (!selectedVesselIdentity || !nextTrackDepth) {
      return
    }

    dispatch(
      updateVesselTrackAndLogbookFromDates(
        selectedVesselIdentity,
        getTrackRequestEndingAt(nextTrackDepth, positionsDateTime)
      )
    )
  }

  const handleDateRangePickerChange = (dateRange: DateRange | undefined) => {
    if (!selectedVesselIdentity) {
      return
    }

    if (!dateRange) {
      const trackRequest = getTrackRequestEndingAt(VesselTrackDepth.TWELVE_HOURS, positionsDateTime)

      dispatch(updateVesselTrackAndLogbookFromDates(selectedVesselIdentity, trackRequest))

      return
    }

    const [startDate, endDate] = dateRange
    const trackRequest: TrackRequestCustom = {
      afterDateTime: startDate,
      beforeDateTime: endDate,
      trackDepth: VesselTrackDepth.CUSTOM
    }

    dispatch(updateVesselTrackAndLogbookFromDates(selectedVesselIdentity, trackRequest))
  }

  return (
    <Wrapper>
      <VesselSidebarActionButton
        $backgroundColor={isOpen ? THEME.color.blueGray : THEME.color.charcoal}
        data-cy="vessel-track-depth-selection"
        onClick={() => setIsOpenedFromClick(!isOpenedFromClick)}
        title="Paramétrer l'affichage de la piste VMS"
      >
        <Icon.Vessel color={THEME.color.white} style={{ margin: 5 }} />
      </VesselSidebarActionButton>
      {isOpen && (
        <TrackRequestBody>
          <Header>Paramétrer l&apos;affichage de la piste VMS</Header>
          <Section>
            <Field>
              <TrackDepthSelection
                defaultValue={selectedTrackDepth ?? defaultVesselTrackDepth}
                isTrackDepthAvailable={trackDepth => isTrackDepthAvailable(trackDepth, isPositionReplayActive)}
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
                withFullDayDefaults
                withTime
              />
            </Field>
            <ExportTrack />
          </Section>
          <Header>Liste des positions VMS affichées</Header>
          <PositionsTable />
        </TrackRequestBody>
      )}
    </Wrapper>
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

const Wrapper = styled.div`
  position: relative;
  height: 30px;
`

/** Opens on the left of its button. */
const TrackRequestBody = styled(MapComponent)`
  background: ${p => p.theme.color.white};
  border-radius: 2px;
  color: ${p => p.theme.color.slateGray};
  display: flex;
  flex-direction: column;
  font-size: 13px;
  position: absolute;
  right: calc(100% + ${GAP_WITH_MAP_BUTTON}px);
  text-align: left;
  top: 0;
  width: 379px;
`
