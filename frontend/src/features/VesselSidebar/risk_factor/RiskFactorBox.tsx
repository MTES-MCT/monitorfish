import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'

import type { CSSProperties } from 'react'

export type RiskFactorBoxProps = {
  children: any
  color?: string | undefined
  // TODO Rename this prop.
  hide?: boolean
  isBig?: boolean
  marginRight?: number
}
export function RiskFactorBox({
  children,
  color = 'transparent',
  hide = false,
  isBig = false,
  marginRight
}: RiskFactorBoxProps) {
  const riskFactorBoxStyle: CSSProperties = {
    background: color,
    borderRadius: 1,
    color: COLORS.white,
    display: 'inline-block',
    fontSize: isBig ? 14 : 13,
    fontWeight: 500,
    height: isBig ? 20 : 17,
    lineHeight: '14px',
    marginRight: marginRight || 8,
    paddingTop: isBig ? 4 : 1,
    textAlign: 'center',
    userSelect: 'none',
    visibility: hide ? 'hidden' : 'visible',
    // eslint-disable-next-line no-nested-ternary
    width: hide ? 13 : isBig ? 36 : 28
  }

  return (
    <RiskFactorBoxDOM data-cy="risk-factor" style={riskFactorBoxStyle}>
      {children}
    </RiskFactorBoxDOM>
  )
}

const RiskFactorBoxDOM = styled.div``
