import { FormikDateRangePicker, FormikEffect, FormikMultiSelect, FormikSelect, TextInput } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop, omit, toPairs, uniq } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { MISSION_FILTER_LABEL_ENUMERATORS, MISSION_FILTER_OPTIONS } from './constants'
import { FilterTagBar } from './FilterTagBar'
import { MissionDateRangeFilter, MissionFilterType } from './types'
import { mapFilterFormRecordsToFilters } from './utils'
import { useGetControlUnitsQuery } from '../../../api/controlUnit'
import { useNewWindow } from '../../../ui/NewWindow'
import { getOptionsFromStrings } from '../../../utils/getOptionsFromStrings'

import type { MissionWithActions } from '../../../domain/entities/mission/types'
import type { AugmentedDataFilter } from '../../../hooks/useTable/types'
import type { Promisable } from 'type-fest'

export type FilterBarProps = {
  onChange: (filters: Array<AugmentedDataFilter<MissionWithActions>>) => Promisable<void>
  onQueryChange: (nextQuery: string | undefined) => Promisable<void>
}
export function FilterBar({ onChange, onQueryChange }: FilterBarProps) {
  const { newWindowContainerRef } = useNewWindow()

  const [isCustomDateRangeOpen, setIsCustomDateRangeOpen] = useState(false)

  const controlUnitsQuery = useGetControlUnitsQuery(undefined)

  const activeControlUnits = useMemo(
    () => (controlUnitsQuery.data || []).filter(({ isArchived }) => !isArchived),
    [controlUnitsQuery.data]
  )

  const administrationsAsOptions = useMemo(() => {
    const administrations = activeControlUnits.map(({ administration }) => administration)
    const uniqueAdministrations = uniq(administrations)
    const uniqueSortedAdministrations = uniqueAdministrations.sort()
    const uniqueSortedAdministrationsAsOptions = getOptionsFromStrings(uniqueSortedAdministrations)

    return uniqueSortedAdministrationsAsOptions
  }, [activeControlUnits])

  const unitsAsOptions = useMemo(() => {
    const units = activeControlUnits.map(({ name }) => name)
    const uniqueUnits = uniq(units)
    const uniqueSortedUnits = uniqueUnits.sort()
    const uniqueSortedUnitsAsOptions = getOptionsFromStrings(uniqueSortedUnits)

    return uniqueSortedUnitsAsOptions
  }, [activeControlUnits])

  const handleFilterFormChange = useCallback(
    (nextFilterValues: Partial<Record<MissionFilterType, string | string[]>>) => {
      const normalizedNextFilterValues =
        nextFilterValues[MissionFilterType.CUSTOM_DATE_RANGE] &&
        nextFilterValues[MissionFilterType.DATE_RANGE] !== MissionDateRangeFilter.CUSTOM
          ? omit(nextFilterValues, MissionFilterType.CUSTOM_DATE_RANGE)
          : nextFilterValues

      const normalizedNextFilterValuePairs = toPairs(normalizedNextFilterValues) as Array<[MissionFilterType, any]>
      const nextFilters = normalizedNextFilterValuePairs.map(mapFilterFormRecordsToFilters)

      const willOpenCustomDateRange = normalizedNextFilterValues.DATE_RANGE === MissionDateRangeFilter.CUSTOM
      setIsCustomDateRangeOpen(willOpenCustomDateRange)

      onChange(nextFilters)
    },
    [onChange]
  )

  return (
    <Formik initialValues={{}} onSubmit={noop}>
      <Box>
        <FormikEffect onChange={handleFilterFormChange} />

        <Row>
          <TextInput
            isLabelHidden
            label="Rechercher un navire"
            name="searchInput"
            onChange={onQueryChange}
            placeholder="Rechercher un navire"
          />
        </Row>

        <Row>
          <FormikSelect
            baseContainer={newWindowContainerRef.current}
            isLabelHidden
            label="Période"
            name={MissionFilterType.DATE_RANGE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.DATE_RANGE]}
            placeholder="Période"
          />
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLabelHidden
            label="Origine"
            name={MissionFilterType.SOURCE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.SOURCE]}
            placeholder="Origine"
            renderValue={(_, items) =>
              items.length > 0 ? <OptionValue>Origine ({items.length}) </OptionValue> : <></>
            }
          />
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLabelHidden
            label="Status"
            name={MissionFilterType.STATUS}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.STATUS]}
            placeholder="Status"
            renderValue={(_, items) => (items.length > 0 ? <OptionValue>Status ({items.length}) </OptionValue> : <></>)}
          />
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            disabled={administrationsAsOptions.length === 0}
            isLabelHidden
            label="Administration"
            name={MissionFilterType.ADMINISTRATION}
            options={administrationsAsOptions}
            placeholder="Administration"
            renderValue={(_, items) =>
              items.length > 0 ? <OptionValue>Administration ({items.length}) </OptionValue> : <></>
            }
            searchable
          />
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            disabled={unitsAsOptions.length === 0}
            isLabelHidden
            label="Unité"
            name={MissionFilterType.UNIT}
            options={unitsAsOptions}
            placeholder="Unité"
            renderValue={(_, items) => (items.length > 0 ? <OptionValue>Unité ({items.length}) </OptionValue> : <></>)}
            searchable
          />
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLabelHidden
            label="Type de mission"
            name={MissionFilterType.TYPE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.TYPE]}
            placeholder="Type de mission"
            renderValue={(_, items) =>
              items.length > 0 ? <OptionValue>Type de mission ({items.length}) </OptionValue> : <></>
            }
          />
        </Row>

        {isCustomDateRangeOpen && (
          <Row>
            <FormikDateRangePicker label="Période spécifique" name={MissionFilterType.CUSTOM_DATE_RANGE} />
          </Row>
        )}

        <FilterTagBar labelEnumerators={MISSION_FILTER_LABEL_ENUMERATORS} />
      </Box>
    </Formik>
  )
}

const Box = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;

  > div:first-child {
    margin-bottom: 24px;
  }
`

const Row = styled.div`
  display: flex;

  > div {
    max-width: 200px;
    min-width: 200px;
    width: 200px;
  }
  > div:not(:first-child) {
    margin-left: 16px;
    width: 160px;
  }
`

const OptionValue = styled.span`
  display: flex;
  overflow: hidden;
  padding: 4px 0 0 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
`
