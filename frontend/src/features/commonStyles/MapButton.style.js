import styled from 'styled-components'

export const MapButtonStyle = styled.button`
  margin-top: ${p => p.healthcheckTextWarning ? 50 : 0}px;
  visibility: ${p => p.isHidden ? 'hidden' : 'visible'};
`
