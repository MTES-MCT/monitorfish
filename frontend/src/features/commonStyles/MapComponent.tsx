import styled from 'styled-components'

export const MapComponent = styled.div<{
  $isHidden?: boolean | undefined
}>`
  visibility: ${p => (p.$isHidden ? 'hidden' : 'visible')};
`
