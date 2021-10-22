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

const X = 0
const Y = 1
const INITIAL_OFFSET_VALUE = [5, -30]
const INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK = [33, -25]

const VesselLabelOverlay = ({
  map,
  coordinates,
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
  previewFilteredVesselsMode
}) => {
  const ref = createRef()

  const currentOffset = useRef(trackIsShown ? INITIAL_OFFSET_VALUE_WHEN_SHOWN_TRACK : INITIAL_OFFSET_VALUE)
  const currentCoordinates = useRef([])
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

  useMoveOverlayWhenDragging(overlay, map, currentOffset, moveVesselLabelWithThrottle, showed)
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
      ref.current.parentNode.className = 'ol-overlay-container ol-selectable overlay-active'
    } else {
      ref.current.parentNode.className = 'ol-overlay-container ol-selectable'
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
      moveLine(featureId, coordinates, nextCoordinates, offset)

      isThrottled.current = false
    }, delay)
  }

  return (
    <WrapperToBeKeptForDOMManagement>
      <Wrapper ref={ref} data-cy={'vessel-label-draggable'}>
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
                            <ZoneText data-cy={'vessel-label-text'}>
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
                            setShowRiskFactorDetails(!showRiskFactorDetails)
                            triggerShowRiskDetails(featureId)
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
                      ? <RiskFactorDetails>
                        <RiskFactorDetail>
                          <RiskFactorBox color={getRiskFactorColor(riskFactor?.impactRiskFactor)}>
                            {parseFloat(riskFactor?.impactRiskFactor).toFixed(1)}
                          </RiskFactorBox>
                          <SubRiskText>
                            { getImpactRiskFactorText(riskFactor?.impactRiskFactor, riskFactor?.hasSegments) }
                          </SubRiskText>
                        </RiskFactorDetail>
                        <RiskFactorDetail>
                          <RiskFactorBox color={getRiskFactorColor(riskFactor?.probabilityRiskFactor)}>
                            {parseFloat(riskFactor?.probabilityRiskFactor).toFixed(1)}
                          </RiskFactorBox>
                          <SubRiskText>
                            { getProbabilityRiskFactorText(riskFactor?.probabilityRiskFactor, riskFactor?.hasBeenControlledLastFiveYears) }
                          </SubRiskText>
                        </RiskFactorDetail>
                        <RiskFactorDetail>
                          <RiskFactorBox color={getRiskFactorColor(riskFactor?.detectabilityRiskFactor)}>
                            {parseFloat(riskFactor?.detectabilityRiskFactor).toFixed(1)}
                          </RiskFactorBox>
                          <SubRiskText>
                            { getDetectabilityRiskFactorText(riskFactor?.detectabilityRiskFactor, false) }
                          </SubRiskText>
                        </RiskFactorDetail>
                      </RiskFactorDetails>
                      : null
                  }
                </>
            : null
        }
      </Wrapper>
    </WrapperToBeKeptForDOMManagement>
  )
}

const Text = styled.div`
  background: ${COLORS.background};
  border-radius: 1px;
`

const SubRiskText = styled.span`
  vertical-align: bottom;
`

const Wrapper = styled.div`
  display: flex;
`

const WrapperToBeKeptForDOMManagement = styled.div`
  z-index: 300;
`

const RiskFactorDetails = styled.div`
  box-shadow: 0px 2px 3px ${COLORS.grayShadow};
  background: ${COLORS.background};
  line-height: 18px;
  height: 72px;
  margin-left: 2px;
  padding-right: 3px;
  transition: 0.2s all;
  cursor: grabbing;
`

const RiskFactorDetail = styled.div`
  display: block;
  margin: 3px;
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
  color: ${COLORS.background};
  background: ${props => props.color};
  line-height: 16px;
  text-align: center;
  margin-right: 3px;
  border-radius: 1px;
`

const VesselLabelOverlayElement = styled.div`
  box-shadow: 0px 2px 3px ${COLORS.grayShadow};
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
  cursor: grabbing;
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
  color: ${COLORS.background};
  background: ${props => props.color};
  line-height: 17px;
  cursor: pointer;
  border-radius: 1px;
  ${props => props.withText ? 'border-bottom-left-radius: 0;' : null}
  ${props => props.withText ? 'border-top-left-radius: 0;' : null}
`

export default VesselLabelOverlay
