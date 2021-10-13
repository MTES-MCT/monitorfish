import styled from 'styled-components'

export const MapComponentStyle = styled.div`
  margin-top: ${props => props.healthcheckTextWarning ? 50 : 0}px;
  visibility: ${props => props.isHidden ? 'hidden' : 'visible'};
`
