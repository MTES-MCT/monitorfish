import { customDayjs, type Undefine } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

import {
  getDetectabilityRiskFactorText,
  getImpactRiskFactorText,
  getProbabilityRiskFactorText,
  getRiskFactorColor
} from '../../../domain/entities/vessel/riskFactor'

type VesselRiskFactorProps = Readonly<
  Undefine<{
    hasVesselRiskFactorSegments: boolean
    isInteractive?: boolean
    isVesselUnderCharter: boolean
    vesselLastControlDateTime?: string
    vesselRiskFactor: number
    vesselRiskFactorDetectability?: number
    vesselRiskFactorImpact?: number
    vesselRiskFactorProbability?: number
  }>
>
// https://github.com/MTES-MCT/monitorfish/issues/3043
export function VesselRiskFactor({
  hasVesselRiskFactorSegments = false,
  isInteractive = false,
  isVesselUnderCharter = false,
  vesselLastControlDateTime,
  vesselRiskFactor,
  vesselRiskFactorDetectability,
  vesselRiskFactorImpact,
  vesselRiskFactorProbability
}: VesselRiskFactorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => {
    if (!isInteractive) {
      return
    }

    setIsOpen(wasOpen => !wasOpen)
  }

  if (!vesselRiskFactor) {
    return '-'
  }

  const hasBeenControlledWithinPastFiveYears = vesselLastControlDateTime
    ? customDayjs(vesselLastControlDateTime).isAfter(customDayjs().subtract(5, 'year'))
    : false

  return (
    <Box data-cy="VesselRiskFactor" onClick={event => event.stopPropagation()}>
      <Score $isInteractive={isInteractive} $value={vesselRiskFactor} onClick={toggle}>
        {vesselRiskFactor.toFixed(1)}
      </Score>
      {isVesselUnderCharter && <UnderCharterAsBadge title="Navire sous charte" />}

      {isInteractive && isOpen && (
        <Detail>
          {isVesselUnderCharter && (
            <DetailRow>
              <UnderCharterAsText />
              <DetailText>Navire sous charte</DetailText>
            </DetailRow>
          )}

          {!!vesselRiskFactorImpact && (
            <DetailRow>
              <DetailScore $value={vesselRiskFactorImpact}>{vesselRiskFactorImpact}</DetailScore>
              <DetailText>{getImpactRiskFactorText(vesselRiskFactorImpact, true)}</DetailText>
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
              <DetailText>
                {getDetectabilityRiskFactorText(vesselRiskFactorDetectability, hasVesselRiskFactorSegments)}
              </DetailText>
            </DetailRow>
          )}
        </Detail>
      )}
    </Box>
  )
}

const Box = styled.div`
  font-size: 13px;
  position: relative;
  width: auto;

  * {
    user-select: none;
  }
`

const Score = styled.div<{
  $isInteractive: boolean
  $value: number
}>`
  align-items: center;
  background-color: ${p => getRiskFactorColor(p.$value)};
  border-radius: 1px;
  color: ${p => p.theme.color.white};
  cursor: ${p => (p.$isInteractive ? 'pointer' : 'default')};
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  height: 22px;
  justify-content: center;
  line-height: 22px;
  text-align: center;
  width: 28px;
`

const Detail = styled.div`
  background: ${p => p.theme.color.white};
  box-shadow: 0px 2px 3px ${p => p.theme.color.charcoalShadow};
  line-height: 18px;
  left: 36px;
  top: -8px;
  position: absolute;
  transition: 0.2s all;
  z-index: 1;
`

const DetailRow = styled.div`
  align-items: center;
  display: flex;
  font-size: 12px;
  font-weight: 500;
  margin-right: 6px;
  margin: 3px;
  text-align: left;
`

const DetailScore = styled.div<{
  $value: number
}>`
  align-items: center;
  background-color: ${p => getRiskFactorColor(p.$value)};
  border-radius: 1px;
  color: ${p => p.theme.color.white};
  display: inline-flex;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  height: 20px;
  justify-content: center;
  line-height: 1;
  margin-right: 3px;
  padding-bottom: 1px;
  width: 26px;
`

const DetailText = styled.span`
  line-height: 1;
  padding-bottom: 2px;
`

const UnderCharter = styled.span`
  background: ${p => p.theme.color.mediumSeaGreen} 0% 0% no-repeat padding-box;
  border-radius: 50%;
  display: inline-block;
  height: 10px;
  width: 10px;
`

const UnderCharterAsBadge = styled(UnderCharter)`
  box-shadow: 0px 2px 3px ${p => p.theme.color.slateGray};
  position: absolute;
  left: 23px;
  top: -4px;
`

const UnderCharterAsText = styled(UnderCharter)`
  margin: 5px 10px 5px 8px;
`
