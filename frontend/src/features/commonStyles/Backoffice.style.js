import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

export const ContentLine = styled.div`
  display: flex;
  flex-direction : ${props => props.isFormOpened && props.isInfoTextShown ? 'column' : 'row'};
  align-items: ${props => props.isFormOpened && props.isInfoTextShown ? 'flex-start' : 'center'};
  margin-bottom: 8px;
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;
`

export const SectionTitle = styled.span`
  text-align: left;
  font-weight: bold;
  font-size: 16px;
  color: ${COLORS.slateGray};
  text-transform: uppercase;
  width: 100%;
  border-bottom: 1px solid ${COLORS.lightGray};
  margin-bottom: 20px;
`

export const Footer = styled.div`
position: fixed;
left: O;
bottom: 0;
width: 100%;
background-color:${COLORS.white};
z-index: 100;
`

export const FooterButton = styled.div`
display: flex;
justify-content: center;
width: 100%;
padding: 15px 0;
`

export const Delimiter = styled.div`
  width: 700px;
  border-bottom: 1px solid ${COLORS.lightGray};
  margin-bottom: 15px;
`

export const Link = styled.a`
color: #0A18DF;
font-size: 13px;
padding: 0px 8px;
cursor: pointer;
`
