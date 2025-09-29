import { THEME } from '@mtes-mct/monitor-ui'
import styled, { css } from 'styled-components'

export const ContentLine = styled.div<{
  $alignedToTop?: boolean
  $isFormOpened?: boolean
  $isInfoTextShown?: boolean
}>`
  display: flex;
  flex-direction: ${p => (p.$isFormOpened && p.$isInfoTextShown ? 'column' : 'row')};
  align-items: ${p => ((!!p.$isFormOpened && !!p.$isInfoTextShown) || !!p.$alignedToTop ? 'flex-start' : 'center')};
  margin-bottom: 12px;
`

export const Title = styled.span`
  text-align: left;
  font-weight: bold;
  font-size: 16px;
  color: #FF3392;
  text-transform: uppercase;
  width: 100%;
  border-bottom: 1px solid ${THEME.color.lightGray};
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
  background-color: ${THEME.color.white};
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
  border-bottom: 1px solid ${THEME.color.lightGray};
  margin-bottom: 15px;
`

export const Link = styled.a<{
  $tagUrl?: boolean
}>`
  font-size: 13px;
  padding: 0px 8px;
  cursor: pointer;
  ${p => (!p.$tagUrl ? 'font-weight: 500;' : '')}
`
export const InfoTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 11px;
  width: 500px;
`

export const InfoText = styled.span<{
  $bold?: boolean
  $red?: boolean
}>`
  ${p => (p.$bold ? 'font-weight: bold;' : '')}
  text-align: left;
  display: inline-block;
  font-size: 13px;
  color: ${p => (p.$red ? THEME.color.maximumRed : THEME.color.gunMetal)};
  padding-left: 8px;
  white-space: pre-line;
`

export const customRadioGroup = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const RegulatorySectionTitle = styled.div`
  display: flex;
  padding: 0px 0px 10px 0px;
  align-items: center;
  font-size: 13px;
  color: #FF3392;
`

export const FormSection = styled.div<{
  $show?: boolean
}>`
  display: ${p => (p.$show ? 'flex' : 'none')};
  ${p => (p.$show ? 'flex-direction: column;' : '')};
  margin-right: 40px;
`

export const FormContent = styled.div<{
  $display?: boolean
}>`
  display: ${p => (!p.$display ? 'none' : 'flex')};
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 15px;
`

export const Section = styled(FormSection)`
  display: ${p => (p.$show ? 'flex' : 'none')};
  ${p => (p.$show ? 'flex-direction: column;' : '')};
  padding-bottom: 60px;
`

export const OtherRemark = styled.div<{
  $show?: boolean
}>`
  display: ${p => (p.$show ? 'flex' : 'none')};
  margin-top: 15px;
`
export const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
`

export const VerticalLine = styled.div`
  width: 1px;
  background: ${THEME.color.lightGray};
  margin-right: 40px;
`
