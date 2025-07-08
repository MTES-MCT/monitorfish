import { VesselLabel } from '@features/Vessel/label.types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import {
  getDetectabilityRiskFactorText,
  getImpactRiskFactorText,
  getProbabilityRiskFactorText,
  getRiskFactorColor
} from '../../../RiskFactor/utils'
import { showVessel } from '../../useCases/showVessel'

export function VesselLabelContent({
  featureId,
  identity,
  label,
  opacity,
  overlayIsPanning,
  overlayRef,
  previewFilteredVesselsMode,
  riskFactorDetailsShowed,
  showed,
  triggerShowRiskDetails
}) {
  const { groupsDisplayed, isRecentSegment, labelText, riskFactor, underCharter, vesselLabel } = label
  const dispatch = useMainAppDispatch()
  const areVesselGroupsDisplayed = useMainAppSelector(state => state.displayedComponent.areVesselGroupsDisplayed)

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

  if (!showed || (!labelText && !riskFactor) || !opacity) {
    return null
  }

  if (previewFilteredVesselsMode) {
    return (
      <>
        {labelText && (
          <ZoneText $isLittle data-cy="vessel-label-text">
            {labelText}
          </ZoneText>
        )}
      </>
    )
  }

  return (
    <>
      <VesselLabelOverlayElement>
        <Text>
          {labelText && (
            <>
              {identity.flagState && (
                <Flag $rel="preload" alt={identity.flagState} src={`flags/${identity.flagState.toLowerCase()}.svg`} />
              )}
              <ZoneText
                data-cy="vessel-label-text"
                onClick={() => {
                  if (!overlayIsPanning.current) {
                    dispatch(showVessel(identity, false))
                  }
                }}
              >
                <Label $isRecentSegment={isRecentSegment} $isSegment={vesselLabel === VesselLabel.VESSEL_FLEET_SEGMENT}>
                  {labelText}
                </Label>
                {areVesselGroupsDisplayed && groupsDisplayed.length > 0 && (
                  <VesselGroups>
                    {groupsDisplayed.map(vesselGroup => (
                      <VesselGroup key={vesselGroup.id} $color={vesselGroup.color} title={vesselGroup.name} />
                    ))}
                  </VesselGroups>
                )}
              </ZoneText>
            </>
          )}
        </Text>
        {riskFactor?.globalRisk && (
          <RiskFactor
            $hasText={labelText}
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
            <SubRiskText>
              {getImpactRiskFactorText(riskFactor?.impactRiskFactor, riskFactor?.hasSegments)}
              {isRecentSegment && (
                <StyledIconInfo color={THEME.color.slateGray} size={16} title="Segment(s) ces 14 derniers jours" />
              )}
            </SubRiskText>
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
      {underCharter && !showRiskFactorDetails && <UnderCharter $hasBoxShadow data-cy={`${labelText}-under-charter`} />}
    </>
  )
}

const Label = styled.span<{
  $isRecentSegment: boolean
  $isSegment: boolean
}>`
  margin-top: 2px;
  padding-left: 2px;
  padding-right: 2px;
  height: 16px;
  display: inline-block;
  line-height: 14px;

  ${p => {
    if (p.$isSegment && p.$isRecentSegment) {
      return 'font-style: italic;'
    }

    if (p.$isSegment && !p.$isRecentSegment) {
      return `background-color: ${p.theme.color.mediumSeaGreen25};`
    }

    return ''
  }}
`

const StyledIconInfo = styled(Icon.Info)`
  margin-left: 4px;
`

const UnderCharter = styled.span<{
  $hasBoxShadow?: boolean
}>`
  border-radius: 5px;
  width: 10px;
  height: 10px;
  background: ${p => p.theme.color.mediumSeaGreen} 0% 0% no-repeat padding-box;
  ${p => (p.$hasBoxShadow ? `box-shadow: 0px 2px 3px ${p.theme.color.slateGray}` : null)};
  margin-left: -5px;
  margin-top: -5px;
  margin-right: 2px;
  display: inline-block;
`

const VesselGroups = styled.span`
  margin-left: 2px;
`

const VesselGroup = styled.span<{
  $color?: string
}>`
  border-radius: 5px;
  width: 10px;
  height: 10px;
  background: ${p => p.$color};
  margin-left: 4px;
  display: inline-block;
`

const Text = styled.div`
  background: ${p => p.theme.color.white};
  border-radius: 1px;
`

const SubRiskText = styled.span`
  vertical-align: bottom;
  font-size: 11px;

  .Element-IconBox {
    vertical-align: middle;
  }
`

const UnderCharterInfo = styled.div`
  display: block;
  padding: 1px 3px;
  text-align: left;
  font-weight: 500;
  border-bottom: 2px solid ${p => p.theme.color.lightGray};
`

const UnderCharterText = styled.span`
  font-size: 11px;
  vertical-align: bottom;
  margin-left: 9px;
`

const RiskFactorDetails = styled.div<{
  $underCharter: boolean
}>`
  box-shadow: 0 2px 3px ${p => p.theme.color.charcoalShadow};
  background: ${p => p.theme.color.white};
  line-height: 18px;
  height: ${p => (p.$underCharter ? 94 : 72)}px;
  margin-left: 2px;
  transition: 0.2s all;
  cursor: grabbing;
`

const RiskFactorDetail = styled.div`
  display: block;
  margin: 3px 6px 3px 3px;
  text-align: left;
  font-size: 11px;
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
  color: ${p => p.theme.color.white};
  background: ${p => p.color};
  line-height: 16px;
  text-align: center;
  margin-right: 5px;
  border-radius: 1px;
`

const VesselLabelOverlayElement = styled.div`
  box-shadow: 0 2px 3px ${p => p.theme.color.charcoalShadow};
  cursor: grabbing;
  height: 20px;
  display: flex;
  border-radius: 1px;
`

const Flag = styled.img<{
  $rel?: 'preload'
}>`
  height: 13px;
  margin: 0 0 8px 4px;
  user-select: none;
`

const ZoneText = styled.span<{
  $isLittle?: boolean
}>`
  margin-bottom: ${p => (p.$isLittle ? 0 : 0)}px;
  margin-right: 4px;
  margin-left: 4px;
  font-size: ${p => (p.$isLittle ? 8 : 11)}px;
  font-weight: 500;
  display: inline-block;
  user-select: none;
  color: ${p => p.theme.color.gunMetal};
  line-height: 13px;
  cursor: pointer;
  overflow: hidden;
`

const RiskFactor = styled.span<{
  $hasText: boolean
}>`
  width: 24px;
  height: 19px;
  padding-top: 1px;
  padding-left: 6px;
  padding-right: 0;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  user-select: none;
  color: ${p => p.theme.color.white};
  background: ${p => p.color};
  line-height: 17px;
  cursor: pointer;
  border-radius: 1px;
  ${p => (p.$hasText ? 'border-bottom-left-radius: 0;' : null)}
  ${p => (p.$hasText ? 'border-top-left-radius: 0;' : null)}
`
