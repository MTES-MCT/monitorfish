import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { CSSProperties } from 'react'

export type RiskFactorBoxProps = Readonly<{
  children: any
  color?: string | undefined
  isBig?: boolean
  marginRight?: number
  style?: CSSProperties
}>
export function RiskFactorBox({
  children,
  color = 'transparent',
  isBig = false,
  marginRight,
  style
}: RiskFactorBoxProps) {
  const riskFactorBoxStyle: CSSProperties = {
    background: color,
    borderRadius: 1,
    color: THEME.color.white,
    display: 'inline-block',
    fontSize: isBig ? 14 : 13,
    fontWeight: 500,
    height: isBig ? 20 : 17,
    lineHeight: '14px',
    marginRight: marginRight ?? 8,
    paddingTop: isBig ? 4 : 1,
    textAlign: 'center',
    userSelect: 'none',
    width: isBig ? 36 : 28,
    ...style
  }

  return (
    <RiskFactorBoxDOM data-cy="risk-factor" style={riskFactorBoxStyle}>
      {children}
    </RiskFactorBoxDOM>
  )
}

const RiskFactorBoxDOM = styled.div``
