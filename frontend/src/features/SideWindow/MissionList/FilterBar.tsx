import { FormikDateRangePicker, FormikEffect, FormikMultiSelect, FormikSelect } from '@mtes-mct/monitor-ui'
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
import type { AugmentedDataFilter, AugmentedDataItem } from '../../../hooks/useTable/types'
import type { Promisable } from 'type-fest'

export type FilterBarProps = {
  augmentedMissionsWithActions: Array<AugmentedDataItem<MissionWithActions>>
  onChange: (filters: Array<AugmentedDataFilter<MissionWithActions>>) => Promisable<void>
}
export function FilterBar({ augmentedMissionsWithActions, onChange }: FilterBarProps) {
  const customFiltersRef = useRef<Array<AugmentedDataFilter<MissionWithActions>>>([])
  const [isCustomDateRangeOpen, setIsCustomDateRangeOpen] = useState(false)

  const { newWindowContainerRef } = useNewWindow()

  const unitsAsOptions = useMemo(
    () =>
      pipe(
        map<AugmentedDataItem<MissionWithActions>, string[]>(({ item: { controlUnits } }) =>
          (controlUnits || []).map(({ name }) => name)
        ),
        flatten,
        uniq,
        getOptionsFromStrings
      )(augmentedMissionsWithActions),
    [augmentedMissionsWithActions]
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
            label="Status"
            name={MissionFilterType.STATUS}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.STATUS]}
            placeholder="Status"
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
            name={MissionFilterType.MISSION_TYPE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.MISSION_TYPE]}
            placeholder="Type de mission"
          />
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLabelHidden
            label="Type de contrôle"
            name={MissionFilterType.INSPECTION_TYPE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.INSPECTION_TYPE]}
            placeholder="Type de contrôle"
          />
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLabelHidden
            label="Alerte"
            name={MissionFilterType.ALERT_TYPE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.ALERT_TYPE]}
            placeholder="Alerte"
          />
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
  margin-bottom: 24px;
`

const Title = styled.h4`
  color: ${p => p.theme.color.slateGray};
  font-size: 16px;
  font-weight: 500;
  margin: 0;
`

const FiltersBox = styled.div`
  display: flex;
  margin-top: 24px;

  > div:not(:first-child) {
    margin-left: 16px;
    width: 160px;
  }
`
