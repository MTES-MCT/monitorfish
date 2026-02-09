import { AlertCriteriaCell } from '@features/Alert/components/SideWindowAlerts/AlertsManagementList/cells/AlertCriteriaCell'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { flexRender, type Row as RowType } from '@tanstack/react-table'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { getExpandableRowCellCustomStyle } from './cells/utils'

import type { PendingAlert } from '@features/Alert/types'
import type { MutableRefObject } from 'react'

type PendingAlertsRowProps = Readonly<{
  row: RowType<PendingAlert>
}>
export function PendingAlertsRow({ row }: PendingAlertsRowProps) {
  const ref = useRef() as MutableRefObject<HTMLTableRowElement>
  const focusedPendingAlertId = useMainAppSelector(state => state.alert.focusedPendingAlertId)

  const alert = row.original

  useEffect(() => {
    if (focusedPendingAlertId && alert.id === focusedPendingAlertId) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [focusedPendingAlertId, alert])

  return (
    <>
      <StyledTr ref={ref} $isFocused={alert.id === focusedPendingAlertId} data-id={row.id}>
        {row?.getVisibleCells().map(cell => (
          <ExpandableRowCell
            key={cell.id}
            $hasRightBorder={['threat'].includes(cell.column.id)}
            onClick={() => row.toggleExpanded()}
            style={getExpandableRowCellCustomStyle(cell.column)}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </ExpandableRowCell>
        ))}
      </StyledTr>

      {row.getIsExpanded() && (
        <ExpandedRow data-id={`${row.id}-expanded`}>
          <ExpandedRowCell />
          <ExpandedRowCell>
            <ExpandedContent $isInline>
              <InlineExpandedRowLabel>CFR - </InlineExpandedRowLabel>
              <InlineExpandedRowValue>{alert.internalReferenceNumber}</InlineExpandedRowValue>
            </ExpandedContent>
            <ExpandedContent $isInline>
              <InlineExpandedRowLabel>Call Sign - </InlineExpandedRowLabel>
              <InlineExpandedRowValue>{alert.ircs}</InlineExpandedRowValue>
            </ExpandedContent>
            <ExpandedContent $isInline>
              <InlineExpandedRowLabel>Marq. ext. - </InlineExpandedRowLabel>
              <InlineExpandedRowValue>{alert.externalReferenceNumber}</InlineExpandedRowValue>
            </ExpandedContent>
          </ExpandedRowCell>
          <ExpandedRowCell>
            <p>
              <ExpandedRowLabel>Description</ExpandedRowLabel>
              <ExpandedRowValue>{alert.alertSpecification.description}</ExpandedRowValue>
            </p>
            {!!alert.alertSpecification.id && (
              <p>
                <ExpandedRowLabel>Position VMS pris en compte</ExpandedRowLabel>
                <ExpandedRowValue>
                  {!!alert.alertSpecification.id &&
                    alert.alertSpecification.onlyFishingPositions &&
                    'Les positions en pêche uniquement'}
                  {!!alert.alertSpecification.id &&
                    !alert.alertSpecification.onlyFishingPositions &&
                    'Toutes les positions en mer'}
                </ExpandedRowValue>
              </p>
            )}
          </ExpandedRowCell>
          <AlertCriteriaCell alertSpecification={alert.alertSpecification} />
          <ExpandedRowCell>
            <ExpandedContent>
              <ExpandedRowLabel>Famille d’infraction</ExpandedRowLabel>
              <ExpandedRowValue>{alert.alertSpecification.threat}</ExpandedRowValue>
            </ExpandedContent>
            <ExpandedContent>
              <ExpandedRowLabel>Type d’infraction</ExpandedRowLabel>
              <ExpandedRowValue>{alert.alertSpecification.threatCharacterization}</ExpandedRowValue>
            </ExpandedContent>
            <ExpandedContent>
              <ExpandedRowLabel>Natinf</ExpandedRowLabel>
              <ExpandedRowValue>{alert.alertSpecification.natinf}</ExpandedRowValue>
            </ExpandedContent>
          </ExpandedRowCell>
          <ExpandedRowCell />
        </ExpandedRow>
      )}
    </>
  )
}

const StyledTr = styled(TableWithSelectableRows.BodyTr)<{
  $isFocused: boolean
}>`
  background: ${p => (p.$isFocused ? p.theme.color.gainsboro : p.theme.color.cultured)};
  transition: background 3s;

  > td {
    background-color: ${p => (p.$isFocused ? p.theme.color.gainsboro : p.theme.color.cultured)};
  }
`

const ExpandableRowCell = styled(TableWithSelectableRows.Td)`
  cursor: pointer;
  user-select: none;
  color: ${p => p.theme.color.charcoal};
  background: inherit;
  vertical-align: middle;
`

const ExpandedRow = styled(TableWithSelectableRows.BodyTr)`
  > td {
    overflow: hidden !important;
    color: ${p => p.theme.color.charcoal};
    background: ${p => p.theme.color.cultured};
  }

  &:hover {
    > td {
      background-color: ${p => p.theme.color.cultured};
    }
  }
`

const ExpandedRowCell = styled(TableWithSelectableRows.Td).attrs(() => ({
  $hasRightBorder: false
}))`
  padding: 16px;
  height: auto;
  vertical-align: top;
  white-space: normal;
`

const ExpandedContent = styled.div<{
  $isInline?: boolean
}>`
  margin-bottom: ${p => (p.$isInline ? 0 : 12)}px;

  &:last-child {
    margin-bottom: 0;
  }
`

const ExpandedRowLabel = styled.div`
  color: ${p => p.theme.color.slateGray};
  font-weight: 400;
  margin-bottom: 4px;
`

const InlineExpandedRowLabel = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 400;
  margin-bottom: 4px;
`

const ExpandedRowValue = styled.span`
  color: inherit;
`

const InlineExpandedRowValue = styled.span`
  color: inherit;
`
