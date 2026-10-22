import { BackOfficeBody } from '@features/BackOffice/components/BackofficeBody'
import { BackOfficeHeader } from '@features/BackOffice/components/BackOfficeHeader'
import { Accent, Button, DataTable, Icon, Select, TextInput, pluralize } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'
import { useDebounce } from 'use-debounce'

import { TABLE_COLUMNS } from './constants'
import { AUTHORIZATION_AUDIT_ACTION_AS_OPTIONS } from '../../constants'
import { useGetAuthorizationAuditLogsQuery } from '../../userManagementApi'

import type { UserManagement } from '../../types'

const PAGE_SIZE = 50
const SEARCH_DEBOUNCE_DELAY_IN_MS = 300
const NO_AUTHORIZATION_AUDIT_LOGS: UserManagement.AuthorizationAuditLog[] = []

export function AuthorizationAuditLogTable() {
  const [action, setAction] = useState<UserManagement.AuthorizationAuditAction | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const [debouncedSearchQuery] = useDebounce(searchQuery, SEARCH_DEBOUNCE_DELAY_IN_MS)
  const [loadedPageCount, setLoadedPageCount] = useState(1)

  const trimmedSearchQuery = debouncedSearchQuery?.trim()
  const filters: UserManagement.AuthorizationAuditLogFilters = {
    action,
    searchQuery: trimmedSearchQuery === '' ? undefined : trimmedSearchQuery
  }
  const { data, isFetching } = useGetAuthorizationAuditLogsQuery({
    apiPaginationParams: { pageNumber: 0, pageSize: PAGE_SIZE * loadedPageCount },
    filters
  })
  const authorizationAuditLogs = data?.data ?? NO_AUTHORIZATION_AUDIT_LOGS
  const totalLength = data?.totalLength ?? 0
  const nextPageLength = Math.min(totalLength - authorizationAuditLogs.length, PAGE_SIZE)

  const updateAction = (nextAction: UserManagement.AuthorizationAuditAction | undefined) => {
    setAction(nextAction)
    setLoadedPageCount(1)
  }

  const updateSearchQuery = (nextSearchQuery: string | undefined) => {
    setSearchQuery(nextSearchQuery)
    setLoadedPageCount(1)
  }

  return (
    <BackOfficeBody>
      <BackOfficeHeader title="Journal des habilitations" />

      <Filters>
        <TextInput
          Icon={Icon.Search}
          isLabelHidden
          label="Rechercher un auteur, une cible, un e-mail..."
          name="searchQuery"
          onChange={updateSearchQuery}
          placeholder="Rechercher un auteur, une cible, un e-mail..."
          value={searchQuery}
        />
        <Select
          isLabelHidden
          label="Filtrer par action"
          name="actionFilter"
          onChange={updateAction}
          options={AUTHORIZATION_AUDIT_ACTION_AS_OPTIONS}
          placeholder="Action"
          value={action}
        />
      </Filters>

      <TableLegend data-cy="authorization-audit-logs-results">
        {totalLength} {pluralize('modification', totalLength)}
      </TableLegend>
      <DataTable
        columns={TABLE_COLUMNS}
        data={authorizationAuditLogs}
        emptyLabel="Aucune modification des habilitations ne correspond à cette recherche."
        // Same order as the backend pages
        initialSorting={[{ desc: true, id: 'createdAtUtc' }]}
        tableOptions={{
          getRowId: authorizationAuditLog => String(authorizationAuditLog.id)
        }}
      />

      {nextPageLength > 0 && (
        <LoadMore
          accent={Accent.SECONDARY}
          disabled={isFetching}
          onClick={() => setLoadedPageCount(count => count + 1)}
        >
          {isFetching
            ? 'Chargement en cours...'
            : `Charger les ${nextPageLength} ${pluralize('modification', nextPageLength)} suivantes`}
        </LoadMore>
      )}
    </BackOfficeBody>
  )
}

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;

  > .Field-TextInput {
    width: 360px;
  }

  > .Field-Select {
    width: 320px;
  }
`

const TableLegend = styled.p`
  color: ${p => p.theme.color.slateGray};
  line-height: 1;
  margin-bottom: 4px;
`

const LoadMore = styled(Button)`
  margin: 16px auto 0;
`
