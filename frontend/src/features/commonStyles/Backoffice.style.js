import styled from 'styled-components'

export const ContentLine = styled.div`
  display: flex;
  flex-direction : ${props => props.isFormOpened && props.isInfoTextShown ? 'column' : 'row'};
  align-items: ${props => props.isFormOpened && props.isInfoTextShown ? 'flex-start' : 'center'};
  margin-bottom: 8px;
`
