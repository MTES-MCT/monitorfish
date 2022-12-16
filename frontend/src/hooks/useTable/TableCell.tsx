import styled from 'styled-components'

export const TableCell = styled.td<{
  textAlign?: 'center' | 'left' | 'right'
}>`
  line-height: 1.125;
  text-align: ${p => p.textAlign ?? 'left'};
`
