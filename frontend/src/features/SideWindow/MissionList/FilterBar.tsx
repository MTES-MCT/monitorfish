import { FormikDateRangePicker, FormikEffect, FormikMultiSelect, FormikSelect } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop, toPairs } from 'lodash'
import { concat, flatten, map, pipe, uniq } from 'ramda'
import { useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { getOptionsFromStrings } from '../../../utils/getOptionsFromStrings'
import { MissionDateRangeFilter, MissionFilterType, MISSION_FILTER_OPTIONS } from './constants'
import { mapFilterFormRecordsToFilters } from './utils'

import type { Mission } from '../../../domain/types/mission'
import type { MissionFilter } from './types'
import type { Promisable } from 'type-fest'

export type FilterBarProps = {
  missions: Mission[]
  onChange: (filters: Array<MissionFilter>) => Promisable<void>
}
export function FilterBar({ missions, onChange }: FilterBarProps) {
  /* eslint-disable no-null/no-null */
  const alertTypeFilterBoxRef = useRef<HTMLDivElement | null>(null)
  // const customDateRangeFilterBoxRef = useRef<HTMLDivElement | null>(null)
  const dateRangeFilterBoxRef = useRef<HTMLDivElement | null>(null)
  const inspectionTypeFilterBoxRef = useRef<HTMLDivElement | null>(null)
  const missionTypeFilterBoxRef = useRef<HTMLDivElement | null>(null)
  const statusFilterBoxRef = useRef<HTMLDivElement | null>(null)
  const unitFilterBoxRef = useRef<HTMLDivElement | null>(null)
  /* eslint-enable no-null/no-null */
  const customFiltersRef = useRef<MissionFilter[]>([])
  const [isCustomDateRangeOpen, setIsCustomDateRangeOpen] = useState(false)

  const unitsAsOptions = useMemo(
    () =>
      pipe(
        map<Mission, string[]>(({ resourceUnits }) => resourceUnits.map(unit => unit.unit)),
        flatten,
        uniq,
        getOptionsFromStrings
      )(missions),
    [missions]
  )

  const handleFilterChange = useCallback(
    (values: Partial<Record<MissionFilterType, string | string[]>>) => {
      const willCustomDateRangeOpen = values.dateRange === MissionDateRangeFilter.CUSTOM
      setIsCustomDateRangeOpen(willCustomDateRangeOpen)

      const nextFilters = pipe(
        toPairs as (values: Partial<Record<MissionFilterType, string | string[]>>) => [MissionFilterType, any][],
        map(mapFilterFormRecordsToFilters),
        concat(customFiltersRef.current)
      )(values)

      onChange(nextFilters)
    },
    [onChange]
  )

  return (
    <Formik initialValues={{}} onSubmit={noop}>
      <Box>
        <Title>FILTRER LA LISTE</Title>

        <FormikEffect onChange={handleFilterChange} />

        <FiltersBox>
          <FilterBox ref={dateRangeFilterBoxRef}>
            {dateRangeFilterBoxRef.current && (
              <FormikSelect
                container={dateRangeFilterBoxRef.current}
                isLabelHidden
                label="Période"
                name={MissionFilterType.DATE_RANGE}
                options={MISSION_FILTER_OPTIONS[MissionFilterType.DATE_RANGE]}
                placeholder="Période"
              />
            )}
          </FilterBox>
          <FilterBox ref={statusFilterBoxRef}>
            {statusFilterBoxRef.current && (
              <FormikMultiSelect
                container={statusFilterBoxRef.current}
                fixedWidth={160}
                isLabelHidden
                label="Status"
                name={MissionFilterType.STATUS}
                options={MISSION_FILTER_OPTIONS[MissionFilterType.STATUS]}
                placeholder="Status"
              />
            )}
          </FilterBox>
          <FilterBox ref={unitFilterBoxRef}>
            {unitFilterBoxRef.current && (
              <FormikMultiSelect
                container={unitFilterBoxRef.current}
                fixedWidth={160}
                isLabelHidden
                label="Unité"
                name={MissionFilterType.UNIT}
                options={unitsAsOptions}
                placeholder="Unité"
              />
            )}
          </FilterBox>
          <FilterBox ref={missionTypeFilterBoxRef}>
            {missionTypeFilterBoxRef.current && (
              <FormikMultiSelect
                container={missionTypeFilterBoxRef.current}
                fixedWidth={160}
                isLabelHidden
                label="Type de mission"
                name={MissionFilterType.MISSION_TYPE}
                options={MISSION_FILTER_OPTIONS[MissionFilterType.MISSION_TYPE]}
                placeholder="Type de mission"
              />
            )}
          </FilterBox>
          <FilterBox ref={inspectionTypeFilterBoxRef}>
            {inspectionTypeFilterBoxRef.current && (
              <FormikMultiSelect
                container={inspectionTypeFilterBoxRef.current}
                fixedWidth={160}
                isLabelHidden
                label="Type de contrôle"
                name={MissionFilterType.INSPECTION_TYPE}
                options={MISSION_FILTER_OPTIONS[MissionFilterType.INSPECTION_TYPE]}
                placeholder="Type de contrôle"
              />
            )}
          </FilterBox>
          <FilterBox ref={alertTypeFilterBoxRef}>
            {alertTypeFilterBoxRef.current && (
              <FormikMultiSelect
                container={alertTypeFilterBoxRef.current}
                fixedWidth={160}
                isLabelHidden
                label="Alerte"
                name={MissionFilterType.ALERT_TYPE}
                options={MISSION_FILTER_OPTIONS[MissionFilterType.ALERT_TYPE]}
                placeholder="Alerte"
              />
            )}
          </FilterBox>
        </FiltersBox>

        {isCustomDateRangeOpen && (
          <FiltersBox>
            isLabelHidden
            <FormikDateRangePicker label="Période spécifique" name={MissionFilterType.CUSTOM_DATE_RANGE} />
          </FiltersBox>
        )}
      </Box>
    </Formik>
  )
}

const Box = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
`

const Title = styled.h4`
  color: ${p => p.theme.color.slateGray};
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`

const FiltersBox = styled.div`
  display: flex;
  margin-top: 1.5rem;

  > div:not(:first-child) {
    margin-left: 1rem;
  }
`

const FilterBox = styled.div`
  position: relative;
`
