import { COUNTRIES_AS_ALPHA3_OPTIONS } from '@constants/index'
import { useGetFleetSegmentsAsOptions } from '@features/FleetSegment/hooks/useGetFleetSegmentsAsOptions'
import { BLUEFIN_TUNA_EXTENDED_SPECY_CODES, BLUEFIN_TUNA_SPECY_CODE } from '@features/PriorNotification/constants'
import { useGetPriorNotificationTypesAsOptions } from '@features/PriorNotification/hooks/useGetPriorNotificationTypesAsOptions'
import { useGetGearsAsTreeOptions } from '@hooks/useGetGearsAsTreeOptions'
import { useGetPortsAsTreeOptions } from '@hooks/useGetPortsAsTreeOptions'
import { useGetSpeciesAsOptions } from '@hooks/useGetSpeciesAsOptions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  DateRangePicker,
  Icon,
  MultiCascader,
  RichBoolean,
  RichBooleanCheckbox,
  Select,
  Size,
  TextInput,
  type DateAsStringRange,
  CheckPicker,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { uniq } from 'lodash'
import { useCallback } from 'react'
import styled from 'styled-components'

import {
  LAST_CONTROL_PERIODS_AS_OPTIONS,
  LastControlPeriod,
  EXPECTED_ARRIVAL_PERIODS_AS_OPTIONS,
  ExpectedArrivalPeriod,
  FILTER_STATUSES_AS_OPTIONS
} from './constants'
import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { priorNotificationActions } from '../../slice'

import type { FilterStatus } from './types'

export function FilterBar() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const { newWindowContainerRef } = useNewWindow()
  const listFilterValues = useMainAppSelector(store => store.priorNotification.listFilterValues)

  const { fleetSegmentsAsOptions } = useGetFleetSegmentsAsOptions()
  const { gearsAsTreeOptions } = useGetGearsAsTreeOptions()
  const { portsAsTreeOptions } = useGetPortsAsTreeOptions()
  const { speciesAsOptions } = useGetSpeciesAsOptions()
  const { priorNotificationTypesAsOptions } = useGetPriorNotificationTypesAsOptions()

  const speciesAsCodeOptions =
    speciesAsOptions?.map(option => ({ label: option.label, value: option.value.code })) ?? []

  const updateCountryCodes = (nextCountryCodes: string[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ countryCodes: nextCountryCodes }))
  }

  const updateExpectedArrivalCustomPeriod = (nextExpectedArrivalCustomPeriod: DateAsStringRange | undefined) => {
    dispatch(
      priorNotificationActions.setListFilterValues({ expectedArrivalCustomPeriod: nextExpectedArrivalCustomPeriod })
    )
  }

  const updateExpectedArrivalPeriod = (nextexpectedArrivalPeriod: ExpectedArrivalPeriod | undefined) => {
    assertNotNullish(nextexpectedArrivalPeriod)

    if (nextexpectedArrivalPeriod !== ExpectedArrivalPeriod.CUSTOM) {
      dispatch(priorNotificationActions.setListFilterValues({ expectedArrivalCustomPeriod: undefined }))
    }
    dispatch(priorNotificationActions.setListFilterValues({ expectedArrivalPeriod: nextexpectedArrivalPeriod }))
  }

  const updateFleetSegments = (nextFleetSegmentSegments: string[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ fleetSegmentSegments: nextFleetSegmentSegments }))
  }

  const updateGearCodes = (nextGearCodes: string[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ gearCodes: nextGearCodes }))
  }

  const updateHasOneOrMoreReportings = useCallback(
    (nextHasOneOrMoreReportings: RichBoolean | undefined) => {
      dispatch(priorNotificationActions.setListFilterValues({ hasOneOrMoreReportings: nextHasOneOrMoreReportings }))
    },
    [dispatch]
  )

  const updateIsLessThanTwelveMetersVessel = (nextIsLessThanTwelveMetersVessel: RichBoolean | undefined) => {
    dispatch(
      priorNotificationActions.setListFilterValues({ isLessThanTwelveMetersVessel: nextIsLessThanTwelveMetersVessel })
    )
  }

  const updateLastControlPeriod = (nextLastControlPeriod: LastControlPeriod | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ lastControlPeriod: nextLastControlPeriod }))
  }

  const updatePortLocodes = (nextPortLocodes: string[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ portLocodes: nextPortLocodes }))
  }

  const updatePriorNotificationTypes = (nextPriorNotificationTypes: string[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ priorNotificationTypes: nextPriorNotificationTypes }))
  }

  const updateSearchQuery = (nextSearchQuery: string | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ searchQuery: nextSearchQuery }))
  }

  const updateSpecyCodes = (nextSpecyCodes: string[] | undefined) => {
    const normalizedNextSpecyCodes = nextSpecyCodes?.includes(BLUEFIN_TUNA_SPECY_CODE)
      ? uniq([...nextSpecyCodes, ...BLUEFIN_TUNA_EXTENDED_SPECY_CODES])
      : nextSpecyCodes

    dispatch(priorNotificationActions.setListFilterValues({ specyCodes: normalizedNextSpecyCodes }))
  }

  const updateStatuses = (nextStatuses: FilterStatus[] | undefined) => {
    dispatch(priorNotificationActions.setListFilterValues({ statuses: nextStatuses }))
  }

  return (
    <Wrapper>
      <Row>
        <TextInput
          Icon={Icon.Search}
          isLabelHidden
          isTransparent
          label="Rechercher un navire"
          name="searchQuery"
          onChange={updateSearchQuery}
          placeholder="Rechercher un navire"
          size={Size.LARGE}
          value={listFilterValues.searchQuery}
        />
      </Row>

      <Row>
        <CheckPicker
          isLabelHidden
          isTransparent
          label="Nationalités"
          name="countryCodes"
          onChange={updateCountryCodes}
          options={COUNTRIES_AS_ALPHA3_OPTIONS}
          placeholder="Nationalité"
          popupWidth={240}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Nationalités ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.countryCodes}
          virtualized
        />
        <CheckPicker
          disabled={!fleetSegmentsAsOptions}
          isLabelHidden
          isTransparent
          label="Segments de flotte"
          name="fleetSegments"
          onChange={updateFleetSegments}
          options={fleetSegmentsAsOptions ?? []}
          placeholder="Segments de flotte"
          popupWidth={320}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Segments de flotte ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.fleetSegmentSegments}
          virtualized
        />
        <CheckPicker
          disabled={!speciesAsCodeOptions}
          isLabelHidden
          isTransparent
          label="Espèces à bord"
          name="specyCodes"
          onChange={updateSpecyCodes}
          options={speciesAsCodeOptions ?? []}
          placeholder="Espèces à bord"
          popupWidth={320}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Espèces à bord ({items.length})</SelectValue> : <></>
          }
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
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Engins utilisés ({items.length})</SelectValue> : <></>
          }
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
          popupWidth={224}
          // TODO Allow width control in monitor-ui.
          style={{ minWidth: 224 }}
          value={listFilterValues.lastControlPeriod}
        />
        {isSuperUser && (
          <RichBooleanCheckbox
            falseOptionLabel="Sans signalement"
            isInline
            isLabelHidden
            label="Signalements"
            name="hasOneOrMoreReportings"
            onChange={updateHasOneOrMoreReportings}
            trueOptionLabel="Avec signalements"
            value={listFilterValues.hasOneOrMoreReportings}
          />
        )}
      </Row>

      <Row>
        <Select
          cleanable={false}
          isLabelHidden
          isTransparent
          label="Date d’arrivée estimée"
          name="expectedArrivalPeriod"
          onChange={updateExpectedArrivalPeriod}
          options={EXPECTED_ARRIVAL_PERIODS_AS_OPTIONS}
          placeholder="Date d’arrivée estimée"
          // TODO Allow width control in monitor-ui.
          style={{ minWidth: 265 }}
          value={listFilterValues.expectedArrivalPeriod}
        />
        <MultiCascader
          disabled={!portsAsTreeOptions}
          isLabelHidden
          isTransparent
          label="Ports d’arrivée"
          name="portLocodes"
          onChange={updatePortLocodes}
          options={portsAsTreeOptions ?? []}
          placeholder="Ports d’arrivée"
          popupWidth={500}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Ports d’arrivée ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.portLocodes}
        />
        <CheckPicker
          disabled={!priorNotificationTypesAsOptions}
          isLabelHidden
          isTransparent
          label="Types de préavis"
          name="priorNotificationTypes"
          onChange={updatePriorNotificationTypes}
          options={priorNotificationTypesAsOptions ?? []}
          placeholder="Types de préavis"
          popupWidth={240}
          renderValue={(_, items) =>
            items.length > 0 ? <SelectValue>Types de préavis ({items.length})</SelectValue> : <></>
          }
          searchable
          value={listFilterValues.priorNotificationTypes}
        />
        <StatusCheckPicker
          isLabelHidden
          isTransparent
          label="Statuts de diffusion"
          name="statuses"
          onChange={updateStatuses}
          options={FILTER_STATUSES_AS_OPTIONS}
          placeholder="Statuts de diffusion"
          renderValue={(_, items) => (items.length > 0 ? <SelectValue>Statuts ({items.length})</SelectValue> : <></>)}
          value={listFilterValues.statuses}
        />
        <RichBooleanCheckbox
          falseOptionLabel="Navires ≥ 12 m"
          isInline
          isLabelHidden
          label="Taille du navire"
          name="isLessThanTwelveMetersVessel"
          onChange={updateIsLessThanTwelveMetersVessel}
          trueOptionLabel="Navires < 12 m"
          value={listFilterValues.isLessThanTwelveMetersVessel}
        />
      </Row>

      {listFilterValues.expectedArrivalPeriod === ExpectedArrivalPeriod.CUSTOM && (
        <Row>
          <DateRangePicker
            baseContainer={newWindowContainerRef.current}
            defaultValue={listFilterValues.expectedArrivalCustomPeriod}
            isStringDate
            isTransparent
            label="Arrivée estimée du navire entre deux dates"
            name="expectedArrivalCustomPeriod"
            onChange={updateExpectedArrivalCustomPeriod}
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
  margin-bottom: 16px;

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

const StatusCheckPicker = styled(CheckPicker<FilterStatus>)`
  [role='listbox'] {
    > [role='option']:last-child {
      border-top: 2px solid ${({ theme }) => theme.color.lightGray};
    }
  }
`

const SelectValue = styled.span`
  display: flex;
  overflow: hidden;
  pointer-events: none;
  text-overflow: ellipsis;
  white-space: nowrap;
`
