import { Checkbox, RadioGroup } from 'rsuite'
import styled, { css } from 'styled-components'

export const ContentLine = styled.div<{
  alignedToTop: boolean
  isFormOpened: boolean
  isInfoTextShown: boolean
}>`
  display: flex;
  flex-direction: ${p => (p.isFormOpened && p.isInfoTextShown ? 'column' : 'row')};
  align-items: ${p => ((p.isFormOpened && p.isInfoTextShown) || p.alignedToTop ? 'flex-start' : 'center')};
  margin-bottom: 8px;
`

export const Title = styled.span`
  text-align: left;
  font-weight: bold;
  font-size: 16px;
  color: ${p => p.theme.color.slateGray};
  text-transform: uppercase;
  width: 100%;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  margin-bottom: 20px;
  padding-bottom: 8px;
  cursor: ${p => (p.onClick !== undefined ? 'pointer' : 'auto')};
`

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  position: fixed;
  left: O;
  bottom: 0;
  width: 100%;
  background-color: ${p => p.theme.color.white};
  z-index: 100;
`

export const FooterButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  padding: 15px 0;
`

export const Delimiter = styled.div<{
  width?: number
}>`
  width: ${p => (p.width ? p.width : '700')}px;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  margin-bottom: 15px;
`

export const Link = styled.a<{
  tagUrl?: string
}>`
  color: ${p => (p.tagUrl ? p.theme.color.gainsboro : p.theme.color.gunMetal)};
  font-size: 13px;
  padding: 0px 8px;
  cursor: pointer;
  ${p => (!p.tagUrl ? 'font-weight: 500;' : '')}
`
export const InfoTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 11px;
  width: 500px;
`

export const InfoText = styled.span<{
  bold: boolean
  red: boolean
}>`
  ${p => (p.bold ? 'font-weight: bold;' : '')}
  text-align: left;
  display: inline-block;
  font-size: 13px;
  color: ${p => (p.red ? p.theme.color.maximumRed : p.theme.color.gunMetal)};
  padding-left: 8px;
  white-space: pre-line;
`

export const CustomCheckbox = styled(Checkbox)`
  padding-right: 15px;
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  display: flex;
  vertical-align: baseline;
  margin-left: 0px;
  .rs-checkbox-wrapper {
    top: 0px !important;
    left: 0px !important;
    border: 1px solid ${p => (p.$isRequired ? p.theme.color.maximumRed : p.theme.color.lightGray)};
  }
  .rs-checkbox-wrapper .rs-checkbox-inner {
    &:before {
      border: none !important;
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
  color: ${p => p.theme.color.slateGray};
`

export const FormSection = styled.div<{
  show: boolean
}>`
  display: ${p => (p.show ? 'flex' : 'none')};
  ${p => (p.show ? 'flex-direction: column;' : '')};
  margin-right: 40px;
`

export const FormContent = styled.div<{
  display: boolean
}>`
  display: ${p => (!p.display ? 'none' : 'flex')};
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 15px;
`

export const Section = styled(FormSection)<{
  show: boolean
}>`
  display: ${p => (p.show ? 'flex' : 'none')};
  ${p => (p.show ? 'flex-direction: column;' : '')};
  padding-bottom: 60px;
`

export const OtherRemark = styled.div<{
  show: boolean
}>`
  display: ${p => (p.show ? 'flex' : 'none')};
  margin-top: 15px;
`
export const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
`

export const VerticalLine = styled.div`
  width: 1px;
  background: ${p => p.theme.color.lightGray};
  margin-right: 40px;
`
