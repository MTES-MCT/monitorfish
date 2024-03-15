import { customDayjs, type Undefine } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import {
  getDetectabilityRiskFactorText,
  getImpactRiskFactorText,
  getProbabilityRiskFactorText,
  getRiskFactorColor
} from '../../../domain/entities/vessel/riskFactor'

// TODO Under charter?
// TODO Top right dot indicator?
type VesselRiskFactorProps = Undefine<{
  hasSegments: boolean
  isVesselUnderCharter: boolean
  vesselLastControlDate: string
  vesselRiskFactor: number
  vesselRiskFactorDetectability: number
  vesselRiskFactorImpact: number
  vesselRiskFactorProbability: number
}>
export function VesselRiskFactor({
  hasSegments = false,
  // isVesselUnderCharter = false,
  vesselLastControlDate,
  vesselRiskFactor,
  vesselRiskFactorDetectability,
  vesselRiskFactorImpact,
  vesselRiskFactorProbability
}: VesselRiskFactorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => {
    setIsOpen(wasOpen => !wasOpen)
  }

  if (!vesselRiskFactor) {
    return '-'
  }

  const hasBeenControlledWithinPastFiveYears = vesselLastControlDate
    ? customDayjs(vesselLastControlDate).isAfter(customDayjs().subtract(5, 'year'))
    : false

  return (
    <Box onClick={event => event.stopPropagation()}>
      <Score $value={vesselRiskFactor} data-cy="vessel-label-risk-factor" onClick={toggle}>
        {vesselRiskFactor.toFixed(0)}
      </Score>

      {isOpen && (
        <Detail data-cy="vessel-label-risk-factor-details">
          {!!vesselRiskFactorImpact && (
            <DetailRow>
              <DetailScore $value={vesselRiskFactorImpact}>{vesselRiskFactorImpact}</DetailScore>
              <DetailText>{getImpactRiskFactorText(vesselRiskFactorImpact, hasSegments)}</DetailText>
            </DetailRow>
          )}

          {!!vesselRiskFactorProbability && (
            <DetailRow>
              <DetailScore $value={vesselRiskFactorProbability}>{vesselRiskFactorProbability}</DetailScore>
              <DetailText>
                {getProbabilityRiskFactorText(vesselRiskFactorProbability, hasBeenControlledWithinPastFiveYears)}
              </DetailText>
            </DetailRow>
          )}

          {!!vesselRiskFactorDetectability && (
            <DetailRow>
              <DetailScore $value={vesselRiskFactorDetectability}>{vesselRiskFactorDetectability}</DetailScore>
              <DetailText>{getDetectabilityRiskFactorText(vesselRiskFactorDetectability, false)}</DetailText>
            </DetailRow>
          )}
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
