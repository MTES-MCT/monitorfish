import { SimpleTable } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export function TableBodyEmptyData() {
  return (
    <tbody>
      <Row>
        <Cell colSpan={4} rowSpan={2}>
          Aucune position
        </Cell>
      </Row>
    </tbody>
  )
}

const Row = styled(SimpleTable.BodyTr)`
  &:hover {
    > td {
      /* Hack to disable hover background color in expanded rows */
      background-color: ${p => p.theme.color.cultured};
    }
  }
`

const Cell = styled(SimpleTable.Td)`
  height: 150px;
  text-align: center;
  vertical-align: middle;
`
