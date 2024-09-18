import { customSentry, CustomSentryMeasurementName } from '@libs/customSentry'
import { TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import { useEffect } from 'react'
import styled from 'styled-components'

import { getTableColumns } from './columns'
import { DEFAULT_PAGE_SIZE } from './constants'

export function TableBodyLoader() {
  const emptyRows = new Array(DEFAULT_PAGE_SIZE).fill(undefined)
  const tableColumns = getTableColumns()

  useEffect(() => () => {
    customSentry.endMeasurement(CustomSentryMeasurementName.MANUAL_PRIOR_NOTIFICATION_FORM_SPINNER, '0', 2000)
  })

  return (
    <tbody>
      {emptyRows.map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Row key={`row-${index}`}>
          {tableColumns.map(column => (
            <TableWithSelectableRows.Td key={column.id} $isLoading />
          ))}
        </Row>
      ))}
    </tbody>
  )
}

const Row = styled(TableWithSelectableRows.BodyTr)`
  &:hover {
    > td {
      /* Hack to disable hover background color in expanded rows */
      background-color: ${p => p.theme.color.cultured};
    }
  }
`
