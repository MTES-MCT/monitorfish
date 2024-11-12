import { backofficePriorNotificationActions } from '@features/PriorNotification/backoffice.slice'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useGetAdministrationsAsOptions } from '@hooks/useGetAdministrationsAsOptions'
import { useGetPortsAsOptions } from '@hooks/useGetPortsAsOptions'
import { Checkbox, Icon, Select, TextInput } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

export function FilterBar() {
  const dispatch = useBackofficeAppDispatch()
  const tableFilterValues = useBackofficeAppSelector(store => store.priorNotification.tableFilterValues)

  const { administrationsAsOptions } = useGetAdministrationsAsOptions()
  const { portsAsOptions } = useGetPortsAsOptions()

  const updateAdministrationId = useCallback(
    (nextValue: number | undefined) => {
      dispatch(backofficePriorNotificationActions.setTableFilterValues({ administrationId: nextValue }))
    },
    [dispatch]
  )

  const updatePortLocode = useCallback(
    (nextValue: string | undefined) => {
      dispatch(backofficePriorNotificationActions.setTableFilterValues({ portLocode: nextValue }))
    },
    [dispatch]
  )

  const updateSearchQuery = useCallback(
    (nextValue: string | undefined) => {
      dispatch(backofficePriorNotificationActions.setTableFilterValues({ searchQuery: nextValue }))
    },
    [dispatch]
  )

  const updateWithAtLeastOneSubscription = useCallback(
    (nextValue: boolean | undefined) => {
      dispatch(backofficePriorNotificationActions.setTableFilterValues({ withAtLeastOneSubscription: nextValue }))
    },
    [dispatch]
  )

  return (
    <Wrapper>
      <TextInput
        Icon={Icon.Search}
        isLabelHidden
        label="Rechercher..."
        name="searchQuery"
        onChange={updateSearchQuery}
        placeholder="Rechercher..."
        value={tableFilterValues.searchQuery}
      />

      <Select
        disabled={!portsAsOptions}
        isLabelHidden
        label="Administration"
        name="administrationId"
        onChange={updateAdministrationId}
        options={administrationsAsOptions ?? []}
        placeholder="Administration"
        searchable
        value={tableFilterValues.administrationId}
      />

      <Select
        disabled={!portsAsOptions}
        isLabelHidden
        label="Port de diffusion"
        name="portLocode"
        onChange={updatePortLocode}
        options={portsAsOptions ?? []}
        placeholder="Port de diffusion"
        searchable
        value={tableFilterValues.portLocode}
      />

      <Checkbox
        checked={tableFilterValues.withAtLeastOneSubscription}
        label="Avec au moins une diffusion"
        name="withAtLeastOneSubscription"
        onChange={updateWithAtLeastOneSubscription}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 24px;

  > .Element-Field:not(:first-child) {
    margin-left: 24px;
    width: 240px;
  }

  > .Field-Checkbox {
    .rs-checkbox-checker {
      line-height: 18px;
    }
  }
`
