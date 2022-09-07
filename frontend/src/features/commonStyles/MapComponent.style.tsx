import styled from 'styled-components'

export const MapComponentStyle = styled.div<{
  healthcheckTextWarning: string | null
  isHidden?: boolean
}>`
  margin-top: ${p => (p.healthcheckTextWarning ? 50 : 0)}px;
  visibility: ${p => (p.isHidden ? 'hidden' : 'visible')};
`
