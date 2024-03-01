import {
  ControlUnit,
  Field,
  Icon,
  MultiCheckbox,
  Select,
  Size,
  TextInput,
  getOptionsFromIdAndName,
  getOptionsFromLabelledEnum
} from '@mtes-mct/monitor-ui'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { controlUnitListDialogActions } from './slice'
import { RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS } from '../../../../api/constants'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendApiError } from '../../../../libs/FrontendApiError'
import { isNotArchived } from '../../../../utils/isNotArchived'
import { useGetStationsQuery } from '../../../Station/stationApi'
import { useGetAdministrationsQuery } from '../../administrationApi'

export function FilterBar() {
  const dispatch = useMainAppDispatch()
  const filtersState = useMainAppSelector(store => store.controlUnitListDialog.filtersState)
  const { data: administrations, error: getAdministrationsError } = useGetAdministrationsQuery(
    undefined,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )
  FrontendApiError.handleIfAny(getAdministrationsError)
  const { data: bases, error: getStationsError } = useGetStationsQuery(
    undefined,
    RTK_FIVE_MINUTES_POLLING_QUERY_OPTIONS
  )
  FrontendApiError.handleIfAny(getStationsError)

  const administrationsAsOptions = useMemo(
    () => getOptionsFromIdAndName((administrations || []).filter(isNotArchived)),
    [administrations]
  )
  const basesAsOptions = useMemo(() => getOptionsFromIdAndName(bases), [bases])
  const categoriesAsOptions = useMemo(
    () => getOptionsFromLabelledEnum(ControlUnit.ControlUnitResourceCategoryLabel),
    []
  )
  const typesAsOptions = useMemo(() => getOptionsFromLabelledEnum(ControlUnit.ControlUnitResourceTypeLabel), [])

  const updateAdministrationId = useCallback(
    (nextValue: number | undefined) => {
      dispatch(controlUnitListDialogActions.setFilter({ key: 'administrationId', value: nextValue }))
    },
    [dispatch]
  )

  const updateBaseId = useCallback(
    (nextValue: number | undefined) => {
      dispatch(controlUnitListDialogActions.setFilter({ key: 'stationId', value: nextValue }))
    },
    [dispatch]
  )

  const updateCategories = useCallback(
    (nextValue: ControlUnit.ControlUnitResourceCategory[] | undefined) => {
      dispatch(controlUnitListDialogActions.setFilter({ key: 'categories', value: nextValue }))
    },
    [dispatch]
  )

  const updateQuery = useCallback(
    (nextValue: string | undefined) => {
      dispatch(controlUnitListDialogActions.setFilter({ key: 'query', value: nextValue }))
    },
    [dispatch]
  )

  const updateType = useCallback(
    (nextValue: string | undefined) => {
      dispatch(controlUnitListDialogActions.setFilter({ key: 'type', value: nextValue }))
    },
    [dispatch]
  )

  if (!administrationsAsOptions || !basesAsOptions) {
    return <p>Chargement en cours...</p>
  }

  return (
    <Wrapper>
      <TextInput
        Icon={Icon.Search}
        isLabelHidden
        isTransparent
        label="Rechercher une unité"
        name="query"
        onChange={updateQuery}
        placeholder="Rechercher une unité"
        size={Size.LARGE}
        value={filtersState.query}
      />
      <Select
        isLabelHidden
        isTransparent
        label="Administration"
        name="administrationId"
        onChange={updateAdministrationId}
        options={administrationsAsOptions}
        placeholder="Administration"
        searchable
        value={filtersState.administrationId}
      />
      <Select
        isLabelHidden
        isTransparent
        label="Type de moyen"
        name="type"
        onChange={updateType}
        options={typesAsOptions}
        placeholder="Type de moyen"
        searchable
        value={filtersState.type}
      />
      <Select
        isLabelHidden
        isTransparent
        label="Base du moyen"
        name="stationId"
        onChange={updateBaseId}
        options={basesAsOptions}
        placeholder="Base du moyen"
        searchable
        value={filtersState.stationId}
      />
      <Field>
        <MultiCheckbox
          isInline
          isLabelHidden
          label="Catégorie de moyen"
          name="category"
          onChange={updateCategories}
          options={categoriesAsOptions}
          value={filtersState.categories}
        />
      </Field>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-bottom: 32px;

  > .Element-Field {
    &:first-child {
      margin-bottom: 8px;
    }

    &:not(:first-child) {
      margin-top: 8px;
    }
  }
`
