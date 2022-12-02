import React, { createRef, useEffect, useRef, useState } from 'react'
import Overlay from 'ol/Overlay'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { useMoveOverlayWhenDragging } from '../../../hooks/useMoveOverlayWhenDragging'
import { useMoveOverlayWhenZooming } from '../../../hooks/useMoveOverlayWhenZooming'
import {
  getDetectabilityRiskFactorText,
  getImpactRiskFactorText,
  getProbabilityRiskFactorText,
  getRiskFactorColor
} from '../../../domain/entities/riskFactor'
import { batch, useDispatch } from 'react-redux'
import showVessel from '../../../domain/use_cases/vessel/showVessel'
import { getVesselVoyage } from '../../../domain/use_cases/vessel/getVesselVoyage'
import { getVesselCompositeIdentifier } from '../../../domain/entities/vessel/vessel'

const X = 0
const Y = 1
const INITIAL_OFFSET_VALUE = [5, -30]
const INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK = [33, -25]

const VesselLabelOverlay = ({
  map,
  coordinates,
  identity,
  offset,
  flagState,
  text,
  riskFactor,
  featureId,
  moveLine,
  zoomHasChanged,
  opacity,
  riskFactorDetailsShowed,
  trackIsShown,
  triggerShowRiskDetails,
  previewFilteredVesselsMode,
  underCharter
}) => {
  const dispatch = useDispatch()
  const ref = createRef()

  const currentOffset = useRef(trackIsShown ? INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK : INITIAL_OFFSET_VALUE)
  const currentCoordinates = useRef([])
  const overlayIsPanning = useRef(false)
  const isThrottled = useRef(false)
  const [showed, setShowed] = useState(false)
  const [showRiskFactorDetails, setShowRiskFactorDetails] = useState(riskFactorDetailsShowed)
  const [overlay] = useState(new Overlay({
    element: ref.current,
    position: coordinates,
    offset: currentOffset.current,
    autoPan: false,
    positioning: 'left-center'
  }))

  useMoveOverlayWhenDragging(overlay, map, currentOffset, moveVesselLabelWithThrottle, showed,
    isPanning => { overlayIsPanning.current = isPanning })
  useMoveOverlayWhenZooming(overlay, INITIAL_OFFSET_VALUE, zoomHasChanged, currentOffset, moveVesselLabelWithThrottle)

  useEffect(() => {
    if (trackIsShown) {
      currentOffset.current = INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK
      overlay.setOffset(INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK)
    }
  }, [trackIsShown])

  useEffect(() => {
    if (map) {
      overlay.setPosition(coordinates)
      overlay.setElement(ref.current)

      map.addOverlay(overlay)
      setShowed(true)

      return () => {
        map.removeOverlay(overlay)
      }
    }
  }, [overlay, coordinates, map])

  useEffect(() => {
    if (showRiskFactorDetails) {
      ref.current.parentNode.style.zIndex = 999999999
    } else {
      ref.current.parentNode.style.zIndex = 'auto'
    }
  }, [showRiskFactorDetails])

  useEffect(() => {
    if (overlay && offset) {
      currentOffset.current = offset
      overlay.setOffset(offset)
    }
  }, [offset, overlay])

  function moveVesselLabelWithThrottle (target, delay) {
    if (isThrottled.current) {
      return
    }

    isThrottled.current = true
    setTimeout(() => {
      const offset = target.getOffset()
      const pixel = map.getPixelFromCoordinate(coordinates)

      const { width, height } = target.getElement().getBoundingClientRect()
      const nextXPixelCenter = pixel[X] + offset[X] + width / 2
      const nextYPixelCenter = pixel[Y] + offset[Y] + height / 2

      const nextCoordinates = map.getCoordinateFromPixel([nextXPixelCenter, nextYPixelCenter])
      currentCoordinates.current = nextCoordinates
      moveLine(featureId, coordinates, nextCoordinates, offset, opacity)

      isThrottled.current = false
    }, delay)
  }

  return (
    <WrapperToBeKeptForDOMManagement>
      <Wrapper
        ref={ref}
        data-cy={`vessel-label-draggable-${getVesselCompositeIdentifier(identity)}`}
        onClick={() => {
          if (overlayIsPanning.current) {
            overlayIsPanning.current = false
          }
        }}
      >
        {
          showed && (text || riskFactor) && opacity
            ? previewFilteredVesselsMode
              ? <>
                {
                  text
                    ? <>
                      <ZoneText
                        isLittle
                        data-cy={'vessel-label-text'}
                      >
                        {text}
                      </ZoneText>
                    </>
                    : null
                }
              </>
              : <>
                <VesselLabelOverlayElement>
                  <Text>
                    {
                      text
                        ? <>
                          {
                            flagState
                              ? <Flag rel="preload" src={`flags/${flagState.toLowerCase()}.svg`}/>
                              : null
                          }
                          <ZoneText
                            data-cy={'vessel-label-text'}
                            onClick={() => {
                              if (!overlayIsPanning.current) {
                                batch(() => {
                                  dispatch(showVessel(identity, false, false))
                                  dispatch(getVesselVoyage(identity, null, false))
                                })
                              }
                            }}
                          >
                            {text}
                          </ZoneText>
                        </>
                        : null
                    }
                  </Text>
                  {
                    riskFactor?.globalRisk
                      ? <RiskFactor
                        withText={text}
                        onClick={() => {
                          if (!overlayIsPanning.current) {
                            setShowRiskFactorDetails(!showRiskFactorDetails)
                            triggerShowRiskDetails(featureId)
                          }
                        }}
                        data-cy={'vessel-label-risk-factor'}
                        color={getRiskFactorColor(riskFactor?.globalRisk)}
                      >
                        {parseFloat(riskFactor?.globalRisk).toFixed(1)}
                      </RiskFactor>
                      : null
                  }
                </VesselLabelOverlayElement>
                {
                  riskFactor && showRiskFactorDetails
                    ? <RiskFactorDetails
                      data-cy={'vessel-label-risk-factor-details'}
                      underCharter={underCharter}
                    >
                      {
                        underCharter
                          ? <UnderCharterInfo>
                            <UnderCharterText>
                              <UnderCharter/> Navire sous charte
                            </UnderCharterText>
                          </UnderCharterInfo>
                          : null
                      }
                      <RiskFactorDetail>
                        <RiskFactorBox color={getRiskFactorColor(riskFactor?.impactRiskFactor)}>
                          {parseFloat(riskFactor?.impactRiskFactor).toFixed(1)}
                        </RiskFactorBox>
                        <SubRiskText>
                          {getImpactRiskFactorText(riskFactor?.impactRiskFactor, riskFactor?.hasSegments)}
                        </SubRiskText>
                      </RiskFactorDetail>
                      <RiskFactorDetail>
                        <RiskFactorBox color={getRiskFactorColor(riskFactor?.probabilityRiskFactor)}>
                          {parseFloat(riskFactor?.probabilityRiskFactor).toFixed(1)}
                        </RiskFactorBox>
                        <SubRiskText>
                          {getProbabilityRiskFactorText(riskFactor?.probabilityRiskFactor, riskFactor?.hasBeenControlledLastFiveYears)}
                        </SubRiskText>
                      </RiskFactorDetail>
                      <RiskFactorDetail>
                        <RiskFactorBox color={getRiskFactorColor(riskFactor?.detectabilityRiskFactor)}>
                          {parseFloat(riskFactor?.detectabilityRiskFactor).toFixed(1)}
                        </RiskFactorBox>
                        <SubRiskText>
                          {getDetectabilityRiskFactorText(riskFactor?.detectabilityRiskFactor, false)}
                        </SubRiskText>
                      </RiskFactorDetail>
                    </RiskFactorDetails>
                    : null
                }
                {
                  underCharter && !showRiskFactorDetails
                    ? <UnderCharter
                      data-cy={`${text}-under-charter`}
                      boxShadow
                    />
                    : null
                }
            </>
            : null
        }
      </Wrapper>
    </WrapperToBeKeptForDOMManagement>
  )
}

const UnderCharter = styled.span`
  border-radius: 5px;
  width: 10px;
  height: 10px;
  background: ${COLORS.mediumSeaGreen} 0% 0% no-repeat padding-box;
  ${props => props.boxShadow ? `box-shadow: 0px 2px 3px ${COLORS.slateGray}` : null};
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

const Wrapper = styled.div`
  display: flex;
`

const WrapperToBeKeptForDOMManagement = styled.div`
  z-index: 300;
`

const RiskFactorDetails = styled.div`
  box-shadow: 0px 2px 3px ${p => p.theme.color.charcoalShadow};
  background: ${COLORS.white};
  line-height: 18px;
  height: ${props => props.underCharter ? 94 : 72}px;
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
  background: ${props => props.color};
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

const Flag = styled.img`
  vertical-align: bottom;
  height: 13px;
  margin: 0 2px 5px 4px;
  user-select: none;
  cursor: grabbing;
  line-height: 17px;
`

const ZoneText = styled.span`
  margin-bottom: ${props => props.isLittle ? 0 : 3}px;
  margin-right: 6px;
  font-size: ${props => props.isLittle ? 8 : 11}px;
  font-weight: 500;
  display: inline-block;
  user-select: none;
  color: ${COLORS.gunMetal};
  line-height: ${props => props.isLittle ? 35 : 17}px;
  cursor: pointer;
  margin-left: 2px;
  vertical-align: middle;
`

const RiskFactor = styled.span`
  width: 28px;
  height: 19px;
  padding-top: 1px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  user-select: none;
  color: ${COLORS.white};
  background: ${props => props.color};
  line-height: 17px;
  cursor: pointer;
  border-radius: 1px;
  ${props => props.withText ? 'border-bottom-left-radius: 0;' : null}
  ${props => props.withText ? 'border-top-left-radius: 0;' : null}
`

export default VesselLabelOverlay
