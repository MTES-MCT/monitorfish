import { COUNTRIES_AS_OPTIONS } from '@constants/index'
import { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import { useGetFleetSegmentsAsOptions } from '@hooks/useGetFleetSegmentsAsOptions'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { useGetPortsAsTreeOptions } from '@hooks/useGetPortsAsTreeOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  DateRangePicker,
  Icon,
  MultiCascader,
  MultiSelect,
  RichBoolean,
  RichBooleanCheckbox,
  Select,
  Size,
  TextInput,
  type DateRange
} from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import {
  LAST_CONTROL_PERIODS_AS_OPTIONS,
  LastControlPeriod,
  PRIOR_NOTIFICATION_TYPES_AS_OPTIONS,
  RECEIVED_AT_PERIODS_AS_OPTIONS,
  ReceivedAtPeriod
} from './constants'
import { priorNotificationActions } from '../../slice'

import type { Promisable } from 'type-fest'

export type FilterBarProps = {
  onQueryChange: (nextQuery: string | undefined) => Promisable<void>
  searchQuery: string | undefined
}
export function FilterBar() {
  const listFilterValues = useMainAppSelector(store => store.priorNotification.listFilterValues)

  const { fleetSegmentsAsOptions } = useGetFleetSegmentsAsOptions()
  const { gearsAsTreeOptions } = useGetGearsAsTreeOptions()
  const { portsAsTreeOptions } = useGetPortsAsTreeOptions()
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const dispatch = useMainAppDispatch()

  const updateCountryCodes = (nextCountryCodes: string[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ countryCodes: nextCountryCodes }))
  }

  const updateFleetSegments = (nextFleetSegmentSegments: string[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ fleetSegmentSegments: nextFleetSegmentSegments }))
  }

  const updateGearCodes = (nextGearCodes: string[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ gearCodes: nextGearCodes }))
  }

  const updateHasOneOrMoreReportings = (nextHasOneOrMoreReportings: RichBoolean | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ hasOneOrMoreReportings: nextHasOneOrMoreReportings }))
  }

  const updateIsLessThanTwelveMetersVessel = (nextIsLessThanTwelveMetersVessel: RichBoolean | undefined) => {
    dispatch(
      priorNotificationActions.setListFilterValues({ isLessThanTwelveMetersVessel: nextIsLessThanTwelveMetersVessel })
    )
  }

  const updateLastControlPeriod = (nextLastControlPeriod: LastControlPeriod | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ lastControlPeriod: nextLastControlPeriod }))
  }

  const updateQuery = (nextQuery: string | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ query: nextQuery }))
  }

  const updatePortLocodes = (nextPortLocodes: string[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ portLocodes: nextPortLocodes }))
  }

  const updateReceivedAtCustomDateRange = (nextReceivedAtCustomDateRange: DateRange | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ receivedAtCustomDateRange: nextReceivedAtCustomDateRange }))
  }

  const updateReceivedAtPeriod = (nextReceivedAtPeriod: ReceivedAtPeriod | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ receivedAtPeriod: nextReceivedAtPeriod }))
  }

  const updateSpecyCodes = (nextSpecyCodes: string[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ specyCodes: nextSpecyCodes }))
  }

  const updateTypes = (nextTypes: PriorNotification.PriorNotificationType[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ types: nextTypes }))
  }

  return (
    <Wrapper>
      <Row>
        <TextInput
          Icon={Icon.Search}
          isLabelHidden
          isTransparent
          label="Rechercher un navire"
          name="query"
          onChange={updateQuery}
          placeholder="Rechercher un navire"
          size={Size.LARGE}
          value={listFilterValues.query}
        />
      </Row>

      <Row>
        <MultiSelect
          isLabelHidden
          isTransparent
          label="Nationalité"
          name="countryCodes"
          onChange={updateCountryCodes}
          options={COUNTRIES_AS_OPTIONS}
          placeholder="Nationalité"
          popupWidth={240}
          searchable
          value={listFilterValues.countryCodes}
          virtualized
        />
        <MultiSelect
          disabled={!fleetSegmentsAsOptions}
          isLabelHidden
          isTransparent
          label="Segments de flotte"
          name="fleetSegments"
          onChange={updateFleetSegments}
          options={fleetSegmentsAsOptions ?? []}
          placeholder="Segments de flotte"
          popupWidth={320}
          searchable
          value={listFilterValues.fleetSegmentSegments}
          virtualized
        />
        <MultiSelect
          disabled={!speciesAsOptions}
          isLabelHidden
          isTransparent
          label="Espèces à bord"
          name="specyCodes"
          onChange={updateSpecyCodes}
          options={speciesAsOptions ?? []}
          placeholder="Espèces à bord"
          popupWidth={320}
          searchable
          value={listFilterValues.specyCodes}
          virtualized
        />
        <MultiCascader
          disabled={!gearsAsTreeOptions}
          isLabelHidden
          isTransparent
          label="Engins utilisés"
          name="gearCodes"
          onChange={updateGearCodes}
          options={gearsAsTreeOptions ?? []}
          placeholder="Engins utilisés"
          popupWidth={500}
          searchable
          value={listFilterValues.gearCodes}
        />
        <Select
          isLabelHidden
          isTransparent
          label="Date du dernier contrôle"
          name="lastControlPeriod"
          onChange={updateLastControlPeriod}
          options={LAST_CONTROL_PERIODS_AS_OPTIONS}
          placeholder="Date du dernier contrôle"
          popupWidth={240}
          style={{ minWidth: 240 }}
          value={listFilterValues.lastControlPeriod}
          virtualized
        />
        <RichBooleanCheckbox
          falseOptionLabel="Sans signalement"
          isInline
          isLabelHidden
          label="Signalements"
          name="isLessThanTwelveMetersVessel"
          onChange={updateHasOneOrMoreReportings}
          trueOptionLabel="Avec signalements"
          value={listFilterValues.hasOneOrMoreReportings}
        />
      </Row>

      <Row>
        <Select
          isLabelHidden
          isTransparent
          label="Date d'envoi du préavis"
          name="receivedAtPeriod"
          onChange={updateReceivedAtPeriod}
          options={RECEIVED_AT_PERIODS_AS_OPTIONS}
          placeholder="Date d'envoi du préavis"
          style={{ minWidth: 265 }}
          value={listFilterValues.receivedAtPeriod}
        />
        <MultiCascader
          disabled={!portsAsTreeOptions}
          isLabelHidden
          isTransparent
          label="Ports d'arrivée"
          name="portLocodes"
          onChange={updatePortLocodes}
          options={portsAsTreeOptions ?? []}
          placeholder="Ports d'arrivée"
          popupWidth={500}
          searchable
          value={listFilterValues.portLocodes}
        />
        <MultiSelect
          disabled={!speciesAsOptions}
          isLabelHidden
          isTransparent
          label="Types de préavis"
          name="types"
          onChange={updateTypes}
          options={PRIOR_NOTIFICATION_TYPES_AS_OPTIONS}
          placeholder="Types de préavis"
          popupWidth={240}
          searchable
          value={listFilterValues.types}
          virtualized
        />
        <RichBooleanCheckbox
          falseOptionLabel="Navires < 12 m"
          isInline
          isLabelHidden
          label="Taille du navire"
          name="isLessThanTwelveMetersVessel"
          onChange={updateIsLessThanTwelveMetersVessel}
          trueOptionLabel="Navires ≥ 12 m"
          value={listFilterValues.isLessThanTwelveMetersVessel}
        />
      </Row>

      {listFilterValues.receivedAtPeriod === ReceivedAtPeriod.CUSTOM && (
        <Row>
          <DateRangePicker
            defaultValue={listFilterValues.receivedAtCustomDateRange}
            isHistorical
            isTransparent
            label="Arrivée estimée du navire entre deux dates"
            name="receivedAtCustomDateRange"
            onChange={updateReceivedAtCustomDateRange}
            withTime
          />
        </Row>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;

  > div:not(:first-child) {
    margin-top: 16px;
  }
`

const Row = styled.div`
  align-items: center;
  display: flex;

  > .Element-Field,
  > .Element-Fieldset {
    min-width: 200px;

    &:not(:first-child) {
      margin-left: 16px;
      width: 160px;
    }
  }

  > .Field-TextInput {
    min-width: 280px;
  }

  > .Field-MultiCheckbox {
    min-width: 320px;
  }
`
