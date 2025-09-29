import { getTrackRequestFromTrackDepth, VesselTrackDepth } from '@features/Vessel/types/vesselTrackDepth'
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
import type { TrackRequestCustom, TrackRequestPredefined } from '@features/Vessel/types/types'
import type { DateRange } from '@mtes-mct/monitor-ui'

type TrackRequestProps = {
  isSidebarOpen: boolean
}
export function TrackRequest({ isSidebarOpen }: TrackRequestProps) {
  const dispatch = useMainAppDispatch()
  const rightMenuIsOpen = useMainAppSelector(state => state.global.rightMenuIsOpen)
  const defaultVesselTrackDepth = useMainAppSelector(state => state.map.defaultVesselTrackDepth)
  const selectedVesselTrackRequest = useMainAppSelector(state => state.vessel.selectedVesselTrackRequest)
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const [isOpenedFromClick, setIsOpenedFromClick] = useState(false)

  const dateRangePickerDefaultValue =
    selectedVesselTrackRequest && selectedVesselTrackRequest.trackDepth === VesselTrackDepth.CUSTOM
      ? ([selectedVesselTrackRequest.afterDateTime, selectedVesselTrackRequest.beforeDateTime] as DateRange)
      : undefined
  const isOpen = isSidebarOpen && isOpenedFromClick

  const handleDateRangeRadioChange = (nextTrackDepth: SelectableVesselTrackDepth | undefined) => {
    if (!selectedVesselIdentity || !nextTrackDepth) {
      return
    }

    const trackRequest: TrackRequestPredefined = {
      afterDateTime: null,
      beforeDateTime: null,
      trackDepth: nextTrackDepth
    }

    dispatch(updateVesselTrackAndLogbookFromDates(selectedVesselIdentity, trackRequest))
  }

  const handleDateRangePickerChange = (dateRange: DateRange | undefined) => {
    if (!selectedVesselIdentity) {
      return
    }

    if (!dateRange) {
      const trackRequest = getTrackRequestFromTrackDepth(VesselTrackDepth.TWELVE_HOURS)

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
    <>
      <VesselSidebarActionButton
        $backgroundColor={isOpen ? THEME.color.blueGray : THEME.color.charcoal}
        $isRightMenuOpen={rightMenuIsOpen}
        $isSidebarOpen={isSidebarOpen}
        $top={118}
        data-cy="vessel-track-depth-selection"
        onClick={() => setIsOpenedFromClick(!isOpenedFromClick)}
        title="Paramétrer l'affichage de la piste VMS"
      >
        <Icon.Vessel color={THEME.color.white} style={{ margin: 5 }} />
      </VesselSidebarActionButton>
      {isOpen && (
        <TrackRequestBody $isRightMenuOpen={rightMenuIsOpen} $isSidebarOpen={isSidebarOpen}>
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
  $isRightMenuOpen: boolean
  $isSidebarOpen: boolean
}>`
  background: ${p => p.theme.color.white};
  border-radius: 2px;
  color: #FF3392;
  display: flex;
  flex-direction: column;
  font-size: 13px;
  margin-right: 540px;
  position: absolute;
  right: ${p => (p.$isRightMenuOpen && p.$isSidebarOpen ? 55 : 10)}px;
  text-align: left;
  top: 118px;
  transition: all 0.3s;
  width: 379px;
`
