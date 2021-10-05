import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { Checkbox } from 'rsuite'

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

export const Title = styled.span`
  text-align: left;
  font-weight: bold;
  font-size: 16px;
  color: ${COLORS.slateGray};
  text-transform: uppercase;
  width: 100%;
  border-bottom: 1px solid ${COLORS.lightGray};
  margin-bottom: 20px;
  padding-bottom: 8px;
  cursor: ${props => props.onClick !== undefined ? 'pointer' : 'auto'};
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
color: ${COLORS.blue};
font-size: 13px;
padding: 0px 8px;
cursor: pointer;
`

export const CustomCheckbox = styled(Checkbox)`
  padding-right: 15px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  display: flex;
  vertical-align: baseline;
  .rs-checkbox-wrapper {
    top: 0px !important;
    left: 0px !important;
  }
  .rs-checkbox-wrapper .rs-checkbox-inner {
    border: 1px solid ${props => props.$isRequired ? COLORS.red : COLORS.lightGray} !important;
    &:before {
      border: 1px solid ${props => props.$isRequired ? COLORS.red : COLORS.lightGray} !important;
      box-sizing: border-box;
    }
    &:after {
      margin-top: 0px !important;
      margin-left: 4px !important;
    }
  }
  .rs-checkbox-checker {
    padding-top: 0px !important;
    padding-left: 24px !important;
} 
`
