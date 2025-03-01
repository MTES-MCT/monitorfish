import { useGetLegacyControlUnitsQuery } from '@api/legacyControlUnit'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  FormikCheckbox,
  FormikCheckPicker,
  FormikDateRangePicker,
  FormikEffect,
  FormikSelect,
  Icon,
  Size,
  TextInput,
  useKey,
  useNewWindow,
  usePrevious
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop, isEqual } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { MISSION_FILTER_LABEL_ENUMS, MISSION_FILTER_OPTIONS } from './constants'
import { missionListActions } from './slice'
import { MissionDateRangeFilter, MissionFilterType } from './types'
import { getControlUnitsNamesFromAdministrations } from './utils'
import { FormikFilterTagBar } from '../../../../ui/formiks/FormikFilterTagBar'
import { getControlUnitsOptionsFromControlUnits } from '../../../ControlUnit/utils'

import type { FilterValues } from './types'
import type { Promisable } from 'type-fest'

export type FilterBarProps = Readonly<{
  onQueryChange: (nextQuery: string | undefined) => Promisable<void>
  searchQuery: string | undefined
}>
export function FilterBar({ onQueryChange, searchQuery }: FilterBarProps) {
  const { newWindowContainerRef } = useNewWindow()

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

        <Row $marginTop={0}>
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

        <Row $marginTop={16}>
          <FormikSelect
            isCleanable={false}
            isLabelHidden
            isTransparent
            label="Période"
            name={MissionFilterType.DATE_RANGE}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.DATE_RANGE]}
            placeholder="Période"
          />
          <FormikCheckPicker
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
          <FormikCheckPicker
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
          />
          <FormikCheckPicker
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
          />
          <InfractionsFilter
            isLabelHidden
            isTransparent
            label="Résultat des contrôles"
            name={MissionFilterType.INFRACTIONS}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.INFRACTIONS]}
            placeholder="Résultat des contrôles"
            renderValue={(_, items) =>
              items.length > 0 ? <OptionValue>Infraction ({items.length}) </OptionValue> : <></>
            }
          />
          <FormikCheckPicker
            isLabelHidden
            isTransparent
            label="Statut de mission"
            name={MissionFilterType.STATUS}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.STATUS]}
            placeholder="Statut de mission"
            renderValue={(_, items) => (items.length > 0 ? <OptionValue>Statut ({items.length}) </OptionValue> : <></>)}
          />
          <FormikCheckPicker
            isLabelHidden
            isTransparent
            label="Etat des données"
            name={MissionFilterType.COMPLETION_STATUS}
            options={MISSION_FILTER_OPTIONS[MissionFilterType.COMPLETION_STATUS]}
            placeholder="Etat des données"
            renderValue={(_, items) =>
              items.length > 0 ? <OptionValue>Etat des données ({items.length}) </OptionValue> : <></>
            }
          />
        </Row>
        <Row $marginTop={16}>
          <FormikCheckbox
            label="Missions avec actions CNSP"
            name={MissionFilterType.WITH_ACTIONS}
            style={{ width: 200 }}
          />
          <FormikCheckbox label="Missions sous JDP" name={MissionFilterType.UNDER_JDP} style={{ width: 200 }} />
        </Row>

        <FormikFilterTagBar
          filterLabelEnums={MISSION_FILTER_LABEL_ENUMS}
          ignoredFilterKeys={[
            MissionFilterType.CUSTOM_DATE_RANGE,
            MissionFilterType.DATE_RANGE,
            MissionFilterType.WITH_ACTIONS,
            MissionFilterType.UNDER_JDP
          ]}
          isResetLinkDisplayed={isCustomDateRangeOpen}
        >
          {isCustomDateRangeOpen && (
            <FormikDateRangePicker
              baseContainer={newWindowContainerRef.current}
              label="Période spécifique"
              name={MissionFilterType.CUSTOM_DATE_RANGE}
            />
          )}
        </FormikFilterTagBar>
      </Wrapper>
    </Formik>
  )
}

const InfractionsFilter = styled(FormikCheckPicker)`
  div {
    min-width: 180px;
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`

const Row = styled.div<{
  $marginTop: number
}>`
  display: flex;
  align-items: center;
  margin-top: ${p => p.$marginTop}px;

  > div {
    min-width: 184px;
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
  text-overflow: ellipsis;
  white-space: nowrap;
`
