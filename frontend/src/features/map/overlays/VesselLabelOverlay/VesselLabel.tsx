import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import {
  getDetectabilityRiskFactorText,
  getImpactRiskFactorText,
  getProbabilityRiskFactorText,
  getRiskFactorColor
} from '../../../../domain/entities/vessel/riskFactor'
import { showVessel } from '../../../../domain/use_cases/vessel/showVessel'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'

export function VesselLabel({
  featureId,
  flagState,
  identity,
  opacity,
  overlayIsPanning,
  overlayRef,
  previewFilteredVesselsMode,
  riskFactor,
  riskFactorDetailsShowed,
  showed,
  text,
  triggerShowRiskDetails,
  underCharter
}) {
  const dispatch = useMainAppDispatch()
  const [showRiskFactorDetails, setShowRiskFactorDetails] = useState(riskFactorDetailsShowed)

  useEffect(() => {
    if (!overlayRef.current?.parentNode) {
      return
    }

    if (showRiskFactorDetails) {
      // eslint-disable-next-line no-param-reassign
      ;(overlayRef.current.parentNode as HTMLDivElement).style.zIndex = '999999999'
    } else {
      // eslint-disable-next-line no-param-reassign
      ;(overlayRef.current.parentNode as HTMLDivElement).style.zIndex = 'auto'
    }
  }, [showRiskFactorDetails, overlayRef])

  if (!showed || (!text && !riskFactor) || !opacity) {
    return null
  }

  return previewFilteredVesselsMode ? (
    <>
      {text ? (
        <ZoneText $isLittle data-cy="vessel-label-text">
          {text}
        </ZoneText>
      ) : null}
    </>
  ) : (
    <>
      <VesselLabelOverlayElement>
        <Text>
          {text && (
            <>
              {flagState ? <Flag $rel="preload" src={`flags/${flagState.toLowerCase()}.svg`} /> : null}
              <ZoneText
                data-cy="vessel-label-text"
                onClick={() => {
                  if (!overlayIsPanning.current) {
                    dispatch(showVessel(identity, false, true))
                  }
                }}
              >
                {text}
              </ZoneText>
            </>
          )}
        </Text>
        {riskFactor?.globalRisk && (
          <RiskFactor
            $hasText={text}
            color={getRiskFactorColor(riskFactor?.globalRisk)}
            data-cy="vessel-label-risk-factor"
            onClick={() => {
              if (!overlayIsPanning.current) {
                setShowRiskFactorDetails(!showRiskFactorDetails)
                triggerShowRiskDetails(featureId)
              }
            }}
          >
            {parseFloat(riskFactor?.globalRisk).toFixed(1)}
          </RiskFactor>
        )}
      </VesselLabelOverlayElement>
      {riskFactor && showRiskFactorDetails && (
        <RiskFactorDetails $underCharter={underCharter} data-cy="vessel-label-risk-factor-details">
          {underCharter && (
            <UnderCharterInfo>
              <UnderCharterText>
                <UnderCharter /> Navire sous charte
              </UnderCharterText>
            </UnderCharterInfo>
          )}
          <RiskFactorDetail>
            <RiskFactorBox color={getRiskFactorColor(riskFactor?.impactRiskFactor)}>
              {parseFloat(riskFactor?.impactRiskFactor).toFixed(1)}
            </RiskFactorBox>
            <SubRiskText>{getImpactRiskFactorText(riskFactor?.impactRiskFactor, riskFactor?.hasSegments)}</SubRiskText>
          </RiskFactorDetail>
          <RiskFactorDetail>
            <RiskFactorBox color={getRiskFactorColor(riskFactor?.probabilityRiskFactor)}>
              {parseFloat(riskFactor?.probabilityRiskFactor).toFixed(1)}
            </RiskFactorBox>
            <SubRiskText>
              {getProbabilityRiskFactorText(
                riskFactor?.probabilityRiskFactor,
                riskFactor?.hasBeenControlledLastFiveYears
              )}
            </SubRiskText>
          </RiskFactorDetail>
          <RiskFactorDetail>
            <RiskFactorBox color={getRiskFactorColor(riskFactor?.detectabilityRiskFactor)}>
              {parseFloat(riskFactor?.detectabilityRiskFactor).toFixed(1)}
            </RiskFactorBox>
            <SubRiskText>{getDetectabilityRiskFactorText(riskFactor?.detectabilityRiskFactor, false)}</SubRiskText>
          </RiskFactorDetail>
        </RiskFactorDetails>
      )}
      {underCharter && !showRiskFactorDetails && <UnderCharter $hasBoxShadow data-cy={`${text}-under-charter`} />}
    </>
  )
}

const UnderCharter = styled.span<{
  $hasBoxShadow?: boolean
}>`
  border-radius: 5px;
  width: 10px;
  height: 10px;
  background: ${COLORS.mediumSeaGreen} 0% 0% no-repeat padding-box;
  ${p => (p.$hasBoxShadow ? `box-shadow: 0px 2px 3px ${COLORS.slateGray}` : null)};
  margin-left: -5px;
  margin-top: -5px;
  margin-right: 2px;
  display: inline-block;
`

const Text = styled.div`
  background: ${COLORS.white};
  border-radius: 1px;
`

const SubRiskText = styled.span`
  vertical-align: bottom;
`

const UnderCharterInfo = styled.div`
  display: block;
  padding: 1px 3px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  border-bottom: 2px solid ${COLORS.lightGray};
`

const UnderCharterText = styled.span`
  vertical-align: bottom;
  margin-left: 9px;
`

const RiskFactorDetails = styled.div<{
  $underCharter: boolean
}>`
  box-shadow: 0px 2px 3px ${p => p.theme.color.charcoalShadow};
  background: ${COLORS.white};
  line-height: 18px;
  height: ${p => (p.$underCharter ? 94 : 72)}px;
  margin-left: 2px;
  transition: 0.2s all;
  cursor: grabbing;
`

const RiskFactorDetail = styled.div`
  display: block;
  margin: 3px;
  margin-right: 6px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
`

const RiskFactorBox = styled.div`
  width: 26px;
  height: 19px;
  padding-top: 1px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  user-select: none;
  color: ${COLORS.white};
  background: ${p => p.color};
  line-height: 16px;
  text-align: center;
  margin-right: 3px;
  border-radius: 1px;
`

const VesselLabelOverlayElement = styled.div`
  box-shadow: 0px 2px 3px ${p => p.theme.color.charcoalShadow};
  line-height: 18px;
  cursor: grabbing;
  height: 20px;
  display: flex;
  border-radius: 1px;
`

const Flag = styled.img<{
  $rel?: 'preload'
}>`
  vertical-align: bottom;
  height: 13px;
  margin: 0 2px 5px 4px;
  user-select: none;
  cursor: grabbing;
  line-height: 17px;
`

const ZoneText = styled.span<{
  $isLittle?: boolean
}>`
  margin-bottom: ${p => (p.$isLittle ? 0 : 3)}px;
  margin-right: 6px;
  font-size: ${p => (p.$isLittle ? 8 : 11)}px;
  font-weight: 500;
  display: inline-block;
  user-select: none;
  color: ${COLORS.gunMetal};
  line-height: ${p => (p.$isLittle ? 35 : 17)}px;
  cursor: pointer;
  margin-left: 2px;
  vertical-align: middle;
`

const RiskFactor = styled.span<{
  $hasText: boolean
}>`
  width: 24px;
  height: 19px;
  padding-top: 1px;
  padding-left: 6px;
  padding-right: 0px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  user-select: none;
  color: ${COLORS.white};
  background: ${p => p.color};
  line-height: 17px;
  cursor: pointer;
  border-radius: 1px;
  ${p => (p.$hasText ? 'border-bottom-left-radius: 0;' : null)}
  ${p => (p.$hasText ? 'border-top-left-radius: 0;' : null)}
`
