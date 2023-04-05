import { FormikDateRangePicker, FormikEffect, FormikMultiSelect, FormikSelect, TextInput } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop, toPairs } from 'lodash'
import { concat, flatten, map, pipe, uniq } from 'ramda'
import { useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { MISSION_FILTER_OPTIONS } from './constants'
import { MissionDateRangeFilter, MissionFilterType } from './types'
import { mapFilterFormRecordsToFilters } from './utils'
import { useNewWindow } from '../../../ui/NewWindow'
import { getOptionsFromStrings } from '../../../utils/getOptionsFromStrings'

import type { MissionWithActions } from '../../../domain/entities/mission/types'
import type { AugmentedDataFilter } from '../../../hooks/useTable/types'
import type { Promisable } from 'type-fest'

export type FilterBarProps = {
  missionsWithActions: MissionWithActions[]
  onChange: (filters: Array<AugmentedDataFilter<MissionWithActions>>) => Promisable<void>
  onQueryChange: (nextQuery: string | undefined) => Promisable<void>
}
export function FilterBar({ missionsWithActions, onChange, onQueryChange }: FilterBarProps) {
  const customFiltersRef = useRef<Array<AugmentedDataFilter<MissionWithActions>>>([])
  const [isCustomDateRangeOpen, setIsCustomDateRangeOpen] = useState(false)

  const { newWindowContainerRef } = useNewWindow()

  const administrationsAsOptions = useMemo(
    () =>
      pipe(
        map<MissionWithActions, string[]>(({ controlUnits }) =>
          (controlUnits || []).map(({ administration }) => administration)
        ),
        flatten,
        uniq,
        getOptionsFromStrings
      )(missionsWithActions),
    [missionsWithActions]
  )

  const unitsAsOptions = useMemo(
    () =>
      pipe(
        map<MissionWithActions, string[]>(({ controlUnits }) => (controlUnits || []).map(({ name }) => name)),
        flatten,
        uniq,
        getOptionsFromStrings
      )(missionsWithActions),
    [missionsWithActions]
  )

  const handleFilterChange = useCallback(
    (filters: Partial<Record<MissionFilterType, string | string[]>>) => {
      const willOpenCustomDateRange = filters.DATE_RANGE === MissionDateRangeFilter.CUSTOM
      setIsCustomDateRangeOpen(willOpenCustomDateRange)

      const nextFilters = pipe(
        toPairs as (filters: Partial<Record<MissionFilterType, string | string[]>>) => [MissionFilterType, any][],
        map(mapFilterFormRecordsToFilters),
        concat(customFiltersRef.current)
      )(filters)

      onChange(nextFilters)
    },
    [onChange]
  )

  return (
    <Formik initialValues={{}} onSubmit={noop}>
      <Box>
        <FormikEffect onChange={handleFilterChange} />

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
          <FormikSelect
            baseContainer={newWindowContainerRef.current}
            isLabelHidden
            label="Origine"
            name={MissionFilterType.SOURCE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.SOURCE]}
            placeholder="Origine"
          />
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLabelHidden
            label="Status"
            name={MissionFilterType.STATUS}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.STATUS]}
            placeholder="Status"
          />
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLabelHidden
            label="Administration"
            name={MissionFilterType.ADMINISTRATION}
            options={administrationsAsOptions}
            placeholder="Administration"
          />
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLabelHidden
            label="Unité"
            name={MissionFilterType.UNIT}
            options={unitsAsOptions}
            placeholder="Unité"
          />
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLabelHidden
            label="Type de mission"
            name={MissionFilterType.TYPE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.TYPE]}
            placeholder="Type de mission"
          />
        </Row>

        {isCustomDateRangeOpen && (
          <Row>
            <FormikDateRangePicker label="Période spécifique" name={MissionFilterType.CUSTOM_DATE_RANGE} />
          </Row>
        )}
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

  > div:not(:first-child) {
    margin-left: 16px;
    width: 160px;
  }
`
