import { TableWithSelectableRows } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export function TableBodyEmptyData() {
  return (
    <tbody>
      <Row>
        <Cell colSpan={10} rowSpan={10}>
          Aucun préavis.
        </Cell>
      </Row>
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

const Cell = styled(TableWithSelectableRows.Td)`
  height: 461px;
  text-align: center;
  vertical-align: middle;
`
