import React from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'

export function RiskFactorBox({ children, color, hide, isBig, marginRight }) {
  const riskFactorBoxStyle = {
    background: color,
    color: COLORS.background,
    display: 'inline-block',
    fontSize: isBig ? 14 : 13,
    fontWeight: 500,
    borderRadius: 1,
    height: isBig ? 20 : 17,
    lineHeight: '14px',
    marginRight: marginRight || 8,
    paddingTop: isBig ? 4 : 1,
    textAlign: 'center',
    userSelect: 'none',
    visibility: hide ? 'hidden' : 'visible',
    width: hide ? 13 : isBig ? 36 : 28,
  }

  return (
    <RiskFactorBoxDOM data-cy="risk-factor" style={riskFactorBoxStyle}>
      {children}
    </RiskFactorBoxDOM>
  )
}

const RiskFactorBoxDOM = styled.div``
