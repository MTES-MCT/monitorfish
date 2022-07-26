import styled, { css } from 'styled-components'
import { COLORS } from '../../constants/constants'
import { Checkbox, RadioGroup } from 'rsuite'

export const ContentLine = styled.div`
  display: flex;
  flex-direction : ${props => props.isFormOpened && props.isInfoTextShown ? 'column' : 'row'};
  align-items: ${props => (props.isFormOpened && props.isInfoTextShown) || props.alignedToTop ? 'flex-start' : 'center'};
  margin-bottom: 8px;
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
  display: flex;
  flex-direction: column;
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
  align-items: flex-end;
  width: 100%;
  padding: 15px 0;
`

export const Delimiter = styled.div`
  width: ${props => props.width ? props.width : '700'}px;
  border-bottom: 1px solid ${COLORS.lightGray};
  margin-bottom: 15px;
`

export const Link = styled.a`
  color: ${props => props.tagUrl ? COLORS.gainsboro : COLORS.gunMetal};
  font-size: 13px;
  padding: 0px 8px;
  cursor: pointer;
  ${props => !props.tagUrl ? 'font-weight: 500;' : ''}
`
export const InfoTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 11px;
  width: 500px;
`

export const InfoText = styled.span`
  ${props => props.bold ? 'font-weight: bold;' : ''}
  text-align: left;
  display: inline-block;
  font-size: 13px;
  color: ${props => props.red ? COLORS.maximumRed : COLORS.gunMetal};
  padding-left: 8px;
  white-space: pre-line;
`

export const CustomCheckbox = styled(Checkbox)`
  padding-right: 15px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  display: flex;
  vertical-align: baseline;
  margin-left: 0px;
  .rs-checkbox-wrapper {
    top: 0px !important;
    left: 0px !important;
    border: 1px solid ${props => props.$isRequired ? COLORS.maximumRed : COLORS.lightGray};
  }
  .rs-checkbox-wrapper .rs-checkbox-inner {
    &:before {
      border: none!important;
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

export const customRadioGroup = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const AuthorizedRadio = styled(RadioGroup)`
  ${customRadioGroup}
`

export const RegulatorySectionTitle = styled.div`
  display: flex;
  padding: 0px 0px 10px 0px;
  align-items: center;
  font-size: 13px;
  color: ${COLORS.slateGray};
`

export const FormSection = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  ${props => props.show ? 'flex-direction: column;' : ''};
  margin-right: 40px;
`

export const FormContent = styled.div`
  display: ${props => !props.display ? 'none' : 'flex'};
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 15px;
`

export const Section = styled(FormSection)`
  display: ${props => props.show ? 'flex' : 'none'};
  ${props => props.show ? 'flex-direction: column;' : ''};
  padding-bottom: 60px;
`

export const OtherRemark = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  margin-top: 15px;
`
export const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
`

export const VerticalLine = styled.div`
  width: 1px;
  background: ${COLORS.lightGray};
  margin-right: 40px;
`
