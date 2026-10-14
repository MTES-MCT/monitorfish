import { Button, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const Red = styled.span`
  background-color: ${THEME.color.maximumRed};
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  margin-left: 5px;
  width: 8px;
`

export const Green = styled.span`
  background-color: ${THEME.color.mediumSeaGreen};
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  margin-left: 5px;
  width: 8px;
`

export const ControlCardWrapper = styled.div`
  background: ${p => p.theme.color.gainsboro};
  width: -moz-available;
  width: -webkit-fill-available;
  margin: 16px;
  padding: 12px 24px 16px 12px;
  color: ${p => p.theme.color.gunMetal};
  display: flex;
  white-space: initial;
`

export const GyroColumn = styled.div``

export const ContentColumn = styled.div`
  width: 100%;
  box-sizing: border-box;
`

export const ControlCardTitle = styled.div`
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 8px;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: inherit;
  max-width: 400px;
  padding-right: 24px;
`

export const ControlCardUnit = styled.span`
  font-weight: normal;
  font-size: 11px;
`

export const ControlCardButton = styled(Button)`
  margin-top: 16px;
  margin-right: 8px;
`
