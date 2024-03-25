import { useGetLegacyControlUnitsQuery } from '@api/legacyControlUnit'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  FormikDateRangePicker,
  FormikEffect,
  FormikMultiSelect,
  FormikSelect,
  Icon,
  Size,
  TextInput,
  useKey,
  usePrevious
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { isEqual } from 'lodash/fp'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { MISSION_FILTER_LABEL_ENUMS, MISSION_FILTER_OPTIONS } from './constants'
import { missionListActions } from './slice'
import { MissionDateRangeFilter, MissionFilterType } from './types'
import { getControlUnitsNamesFromAdministrations } from './utils'
import { getControlUnitsOptionsFromControlUnits } from '../../../../domain/entities/controlUnits/utils'
import { FormikFilterTagBar } from '../../../../ui/formiks/FormikFilterTagBar'

import type { FilterValues } from './types'
import type { Promisable } from 'type-fest'

export type FilterBarProps = {
  onQueryChange: (nextQuery: string | undefined) => Promisable<void>
  searchQuery: string | undefined
}
export function FilterBar({ onQueryChange, searchQuery }: FilterBarProps) {
  const listFilterValues = useMainAppSelector(store => store.missionList.listFilterValues)

  const [isCustomDateRangeOpen, setIsCustomDateRangeOpen] = useState(false)

  const controlUnitsQuery = useGetLegacyControlUnitsQuery(undefined)
  const dispatch = useMainAppDispatch()

  const previousAdministrationFiterValue = usePrevious(listFilterValues.ADMINISTRATION)
  const { activeAndFilteredUnitsAsOptions, administrationsAsOptions } = useMemo(
    () => getControlUnitsOptionsFromControlUnits(controlUnitsQuery.data, listFilterValues.ADMINISTRATION),
    [controlUnitsQuery.data, listFilterValues.ADMINISTRATION]
  )

  const formikKey = useKey([listFilterValues])
  const unitMultiSelectKey = useKey([activeAndFilteredUnitsAsOptions])

  const handleFilterFormChange = useCallback(
    (nextFilterValues: FilterValues) => {
      const normalizedNextFilterValues = { ...nextFilterValues }

      // If there is a custom date range filter and the date range filter is not set to "custom",
      if (
        nextFilterValues.CUSTOM_DATE_RANGE &&
        normalizedNextFilterValues.DATE_RANGE !== MissionDateRangeFilter.CUSTOM
      ) {
        // we need to undefined custom date range filter
        normalizedNextFilterValues.CUSTOM_DATE_RANGE = undefined
      }

      // We remove selected units that are not linked to the currently selected administrations when some are
      if (
        controlUnitsQuery.data &&
        nextFilterValues.UNIT &&
        // We don't want to run that when the user check new units without touching the administrations select
        !isEqual(previousAdministrationFiterValue, normalizedNextFilterValues.ADMINISTRATION)
      ) {
        const selectedAdministrationsUnits = normalizedNextFilterValues.ADMINISTRATION
          ? getControlUnitsNamesFromAdministrations(controlUnitsQuery.data, normalizedNextFilterValues.ADMINISTRATION)
          : []

        normalizedNextFilterValues.UNIT = nextFilterValues.UNIT.filter(unit =>
          selectedAdministrationsUnits.includes(unit)
        )
      }

      // Depending on the date range filter being set to "custom" or not, we need to toggle the custom date range filter
      const willCustomDateRangeOpen = normalizedNextFilterValues.DATE_RANGE === MissionDateRangeFilter.CUSTOM
      setIsCustomDateRangeOpen(willCustomDateRangeOpen)

      dispatch(missionListActions.setListFilterValues(normalizedNextFilterValues))
    },
    [controlUnitsQuery.data, dispatch, previousAdministrationFiterValue]
  )

  return (
    <Formik key={formikKey} initialValues={listFilterValues} onSubmit={noop}>
      <Wrapper>
        <FormikEffect onChange={handleFilterFormChange} />

        <Row>
          <TextInput
            Icon={Icon.Search}
            isLabelHidden
            isTransparent
            label="Rechercher un navire"
            name="searchInput"
            onChange={onQueryChange}
            placeholder="Rechercher un navire"
            size={Size.LARGE}
            value={searchQuery}
          />
        </Row>

        <Row>
          <FormikSelect
            isCleanable={false}
            isLabelHidden
            isTransparent
            label="Période"
            name={MissionFilterType.DATE_RANGE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.DATE_RANGE]}
            placeholder="Période"
          />
          <FormikSelect
            isLabelHidden
            isTransparent
            label="Origine"
            name={MissionFilterType.SOURCE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.SOURCE]}
            placeholder="Origine"
          />
          <FormikMultiSelect
            isLabelHidden
            isTransparent
            label="Statut"
            name={MissionFilterType.STATUS}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.STATUS]}
            placeholder="Statut"
            renderValue={(_, items) => (items.length > 0 ? <OptionValue>Statut ({items.length}) </OptionValue> : <></>)}
          />
          <FormikMultiSelect
            disabled={administrationsAsOptions.length === 0}
            isLabelHidden
            isTransparent
            label="Administration"
            name={MissionFilterType.ADMINISTRATION}
            options={administrationsAsOptions}
            placeholder="Administration"
            renderValue={(_, items) =>
              items.length > 0 ? <OptionValue>Administration ({items.length}) </OptionValue> : <></>
            }
            searchable
            style={{ minWidth: 200 }}
          />
          <FormikMultiSelect
            key={unitMultiSelectKey}
            disabled={activeAndFilteredUnitsAsOptions.length === 0}
            isLabelHidden
            isTransparent
            label="Unité"
            name={MissionFilterType.UNIT}
            options={activeAndFilteredUnitsAsOptions}
            placeholder="Unité"
            renderValue={(_, items) => (items.length > 0 ? <OptionValue>Unité ({items.length}) </OptionValue> : <></>)}
            searchable
            style={{ minWidth: 200 }}
          />
          <FormikMultiSelect
            isLabelHidden
            isTransparent
            label="Type de mission"
            name={MissionFilterType.TYPE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.TYPE]}
            placeholder="Type de mission"
            renderValue={(_, items) =>
              items.length > 0 ? <OptionValue>Type de mission ({items.length}) </OptionValue> : <></>
            }
          />
        </Row>

        <FormikFilterTagBar
          filterLabelEnums={MISSION_FILTER_LABEL_ENUMS}
          ignoredFilterKeys={[
            MissionFilterType.CUSTOM_DATE_RANGE,
            MissionFilterType.DATE_RANGE,
            MissionFilterType.SOURCE
          ]}
        >
          {isCustomDateRangeOpen && (
            <FormikDateRangePicker label="Période spécifique" name={MissionFilterType.CUSTOM_DATE_RANGE} />
          )}
        </FormikFilterTagBar>
      </Wrapper>
    </Formik>
  )
}

const Wrapper = styled.div`
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
    min-width: 200px;
  }
  > div:not(:first-child) {
    margin-left: 16px;
    width: 160px;
  }

  /* TODO Remove this fix once we get rid of local CSS. */
  > .Field-TextInput {
    > div {
      width: 264px;

      > [name='searchInput'] {
        height: 40px;
      }
    }
  }
`

export const OptionValue = styled.span`
  display: flex;
  overflow: hidden;
  padding: 4px 0 0 8px;
  pointer-events: none;
  text-overflow: ellipsis;
  white-space: nowrap;
`
