import { AlertCriteriaCell } from '@features/Alert/components/SideWindowAlerts/AlertsManagementList/cells/AlertCriteriaCell'
import { getExpandableRowCellCustomStyle } from '@features/Alert/components/SideWindowAlerts/AlertsManagementList/cells/utils'
import { type AlertSpecification } from '@features/Alert/types'
import { TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { flexRender, type Row as RowType } from '@tanstack/react-table'
import styled from 'styled-components'

type RowProps = Readonly<{
  row: RowType<AlertSpecification>
}>
export function Row({ row }: RowProps) {
  const alertSpecification = row.original

  return (
    <>
      <StyledTr $isInError={alertSpecification.isInError} data-id={row.id}>
        {row?.getVisibleCells().map(cell => (
          <ExpandableRowCell
            key={cell.id}
            $hasRightBorder={['validityPeriod'].includes(cell.column.id)}
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
            <p>
              <ExpandedRowLabel>Description</ExpandedRowLabel>
              <ExpandedRowValue>{alertSpecification.description}</ExpandedRowValue>
            </p>
            {!!alertSpecification.id && (
              <p>
                <ExpandedRowLabel>Position VMS pris en compte</ExpandedRowLabel>
                <ExpandedRowValue>
                  {!!alertSpecification.id &&
                    alertSpecification.onlyFishingPositions &&
                    'Les positions en pêche uniquement'}
                  {!!alertSpecification.id && !alertSpecification.onlyFishingPositions && 'Toutes les positions en mer'}
                </ExpandedRowValue>
              </p>
            )}
          </ExpandedRowCell>
          <AlertCriteriaCell alertSpecification={alertSpecification} />
          <ExpandedRowCell>
            <p>
              <ExpandedRowLabel>Délai de visibilité</ExpandedRowLabel>
              <ExpandedRowValue>{alertSpecification.trackAnalysisDepth} heures</ExpandedRowValue>
            </p>
            <p>
              <ExpandedRowLabel>Fréquence d&apos;actualisation</ExpandedRowLabel>
              <ExpandedRowValue>10 minutes</ExpandedRowValue>
            </p>
            <p>
              <ExpandedRowLabel>Archivage auto des signalements</ExpandedRowLabel>
              <ExpandedRowValue>
                {alertSpecification.hasAutomaticArchiving ? 'Oui, quand le navire fait un nouveau DEP.' : 'Non'}
              </ExpandedRowValue>
            </p>
          </ExpandedRowCell>
          <ExpandedRowCell />
        </ExpandedRow>
      )}
    </>
  )
}

const StyledTr = styled(TableWithSelectableRows.BodyTr)<{
  $isInError: boolean
}>`
  > td {
    background-color: ${p => (p.$isInError ? p.theme.color.maximumRed15 : p.theme.color.cultured)};
  }
`

const ExpandableRowCell = styled(TableWithSelectableRows.Td)`
  cursor: pointer;
  user-select: none;
  color: ${p => p.theme.color.charcoal};
  background: ${p => p.theme.color.cultured};
`

// TODO Add this feature in monitor-ui.
const ExpandedRow = styled(TableWithSelectableRows.BodyTr)`
  > td {
    overflow: hidden !important;
    color: ${p => p.theme.color.charcoal};
    background: ${p => p.theme.color.cultured};
  }

  &:hover {
    > td {
      /* Hack to disable hover background color in expanded rows */
      background-color: ${p => p.theme.color.cultured};
    }
  }
`

const ExpandedRowCell = styled(TableWithSelectableRows.Td).attrs(props => ({
  ...props,
  $hasRightBorder: false
}))`
  padding: 8px 16px 16px;
  height: 42px;
  vertical-align: top;
  white-space: normal;

  > p:not(:first-child) {
    margin-top: 16px;
  }
`

const ExpandedRowLabel = styled.span`
  color: ${p => p.theme.color.slateGray};
  display: block;
  font-weight: 400;
  width: 100%;
`
const ExpandedRowValue = styled.span<{
  $isLight?: boolean
}>`
  color: ${p => (p.$isLight ? p.theme.color.slateGray : 'inherit')};
  display: block;
`
