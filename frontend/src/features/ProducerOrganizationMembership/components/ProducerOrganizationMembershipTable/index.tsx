import { ErrorWall } from '@components/ErrorWall'
import { BackOfficeBody } from '@features/BackOffice/components/BackofficeBody'
import { BackOfficeTitle } from '@features/BackOffice/components/BackOfficeTitle'
import { useGetProducerOrganizationMembershipsQuery } from '@features/ProducerOrganizationMembership/apis'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import { Accent, Button, DataTable, pluralize } from '@mtes-mct/monitor-ui'
import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { DEFAULT_ROWS_DISPLAYED, MEMBERSHIP_SEARCH_OPTIONS, TABLE_COLUMNS } from './constants'
import { FilterBar } from './FilterBar'

export function ProducerOrganizationMembershipTable() {
  const searchQuery = useBackofficeAppSelector(store => store.producerOrganizationMembership.searchQuery)
  const displayedError = useBackofficeAppSelector(
    state => state.displayedError[DisplayedErrorKey.BACKOFFICE_PRODUCER_ORGANIZATION_ERROR]
  )
  const [rowsDisplayed, setRowsDisplayed] = useState<number>(DEFAULT_ROWS_DISPLAYED)

  const { data: memberships = [] } = useGetProducerOrganizationMembershipsQuery()

  const fuse = useMemo(
    () => (memberships ? new Fuse(memberships, MEMBERSHIP_SEARCH_OPTIONS) : undefined),
    [memberships]
  )

  const filteredMemberships =
    !!searchQuery?.length && fuse ? fuse.search(searchQuery).map(result => result.item) : memberships
  const displayedMemberships = filteredMemberships.slice(0, rowsDisplayed)

  if (displayedError) {
    return (
      <BackOfficeBody>
        <ErrorWall displayedErrorKey={DisplayedErrorKey.BACKOFFICE_PRODUCER_ORGANIZATION_ERROR} isAbsolute />
      </BackOfficeBody>
    )
  }

  return (
    <BackOfficeBody>
      <BackOfficeTitle>Adhésions aux Organisations de Producteurs (OP)</BackOfficeTitle>

      <FilterBar />

      <TableLegend data-cy="producer_organization_memberships_results">
        {filteredMemberships.length} {pluralize('résultat', filteredMemberships.length)}
      </TableLegend>
      <DataTable
        columns={TABLE_COLUMNS}
        data={displayedMemberships}
        initialSorting={[{ desc: false, id: 'joiningDate' }]}
      />

      {filteredMemberships > displayedMemberships && (
        <SeeMore accent={Accent.SECONDARY} onClick={() => setRowsDisplayed(previous => previous + 50)}>
          Afficher plus
        </SeeMore>
      )}
    </BackOfficeBody>
  )
}

const TableLegend = styled.p`
  color: ${p => p.theme.color.slateGray};
  line-height: 1;
  margin-bottom: 4px;
`

const SeeMore = styled(Button)`
  margin-left: auto;
  margin-right: auto;
  margin-top: 16px;
`
