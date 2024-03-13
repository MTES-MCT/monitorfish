import { customDayjs } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import {
  getDetectabilityRiskFactorText,
  getImpactRiskFactorText,
  getProbabilityRiskFactorText,
  getRiskFactorColor
} from '../../../../domain/entities/vessel/riskFactor'

import type { RiskFactor as RiskFactorType } from '../../../../domain/entities/vessel/riskFactor/types'

// TODO Under charter?
// TODO Top right dot indicator?
type VesselRiskFactorProps = {
  vesselRiskFactor: RiskFactorType | undefined
}
export function VesselRiskFactor({ vesselRiskFactor }: VesselRiskFactorProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!vesselRiskFactor) {
    return '-'
  }

  const hasBeenControlledWithinPastFiveYears = customDayjs(vesselRiskFactor.lastControlDatetime).isAfter(
    customDayjs().subtract(5, 'year')
  )

  return (
    <Box onClick={event => event.stopPropagation()}>
      <Score
        $value={vesselRiskFactor.riskFactor}
        data-cy="vessel-label-risk-factor"
        onClick={() => {
          setIsOpen(!isOpen)
        }}
      >
        {vesselRiskFactor.riskFactor.toFixed(0)}
      </Score>
      {isOpen && (
        <Detail data-cy="vessel-label-risk-factor-details">
          <DetailRow>
            <DetailScore $value={vesselRiskFactor.impactRiskFactor}>{vesselRiskFactor.impactRiskFactor}</DetailScore>
            <DetailText>
              {/* TODO Check and implement that. */}
              {/* {getImpactRiskFactorText(vesselRiskFactor.impactRiskFactor, vesselRiskFactor.hasSegments)} */}
              {getImpactRiskFactorText(vesselRiskFactor.impactRiskFactor, true)}
            </DetailText>
          </DetailRow>
          <DetailRow>
            <DetailScore $value={vesselRiskFactor.probabilityRiskFactor}>
              {vesselRiskFactor.probabilityRiskFactor}
            </DetailScore>
            <DetailText>
              {getProbabilityRiskFactorText(
                vesselRiskFactor.probabilityRiskFactor,
                hasBeenControlledWithinPastFiveYears
              )}
            </DetailText>
          </DetailRow>
          <DetailRow>
            <DetailScore $value={vesselRiskFactor.detectabilityRiskFactor}>
              {vesselRiskFactor.detectabilityRiskFactor}
            </DetailScore>
            <DetailText>{getDetectabilityRiskFactorText(vesselRiskFactor.detectabilityRiskFactor, false)}</DetailText>
          </DetailRow>
        </Detail>
      )}
    </Box>
  )
}

const Box = styled.span`
  position: relative;
  width: auto;

  * {
    user-select: none;
  }
`

const Score = styled.button<{
  $value: number
}>`
  align-items: center;
  background-color: ${p => getRiskFactorColor(p.$value)};
  border-radius: 1px;
  color: ${p => p.theme.color.white};
  display: flex;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  height: 22px;
  justify-content: center;
  line-height: 1;
  padding: 0 0 2px;
  width: 28px;
`

const Detail = styled.div`
  background: ${p => p.theme.color.white};
  box-shadow: 0px 2px 3px ${p => p.theme.color.charcoalShadow};
  height: 72px;
  line-height: 18px;
  margin-left: 2px;
  position: absolute;
  transition: 0.2s all;
`

const DetailRow = styled.div`
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-right: 6px;
  margin: 3px;
  text-align: left;
`

const DetailScore = styled.div<{
  $value: number
}>`
  background-color: ${p => getRiskFactorColor(p.$value)};
  border-radius: 1px;
  color: ${p => p.theme.color.white};
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  height: 19px;
  line-height: 16px;
  margin-right: 3px;
  padding-top: 1px;
  text-align: center;
  user-select: none;
  width: 26px;
`

const DetailText = styled.span`
  vertical-align: bottom;
`
