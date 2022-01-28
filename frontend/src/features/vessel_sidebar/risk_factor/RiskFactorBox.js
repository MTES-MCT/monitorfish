import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import React from 'react'

export const RiskFactorBox = ({ hide, color, marginRight, isBig, children }) => {
  const riskFactorBoxStyle = {
    height: isBig ? 20 : 17,
    paddingTop: isBig ? 4 : 1,
    fontSize: isBig ? 14 : 13,
    fontWeight: 500,
    display: 'inline-block',
    userSelect: 'none',
    color: COLORS.background,
    background: color,
    lineHeight: '14px',
    textAlign: 'center',
    marginRight: marginRight || 8,
    visibility: hide ? 'hidden' : 'visible',
    width: hide ? 13 : isBig ? 36 : 28,
    borderRadius: 1
  }

  return <RiskFactorBoxDOM data-cy={'risk-factor'} style={riskFactorBoxStyle}>
    {children}
  </RiskFactorBoxDOM>
}

const RiskFactorBoxDOM = styled.div``
