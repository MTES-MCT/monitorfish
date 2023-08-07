import React from 'react'
import styled from 'styled-components'
import { getCoordinates } from '../../../../coordinates'
import { getDateTime, timeagoFrenchLocale } from '../../../../utils'
import { OPENLAYERS_PROJECTION } from '../../../../domain/entities/map/constants'
import { COLORS } from '../../../../constants/constants'
import * as timeago from 'timeago.js'
import { useSelector } from 'react-redux'
import { OverlayPosition } from '../Overlay'

timeago.register('fr', timeagoFrenchLocale)

const VesselTrackCard = ({ feature, overlayPosition }) => {
  const { coordinatesFormat } = useSelector(state => state.map)

  return (
    <>
      <VesselCardHeader>
        <VesselCardTitle>POSITION</VesselCardTitle>
        <TimeAgo>
          {
            feature.dateTime
              ? <>
                {timeago.format(feature.dateTime, 'fr')}</>
              : <NoValue>-</NoValue>
          }
        </TimeAgo>
      </VesselCardHeader>
      <VesselCardBody>
        <LatLon>
          <FieldName>Latitude</FieldName>
          <FieldValue data-cy={'vessel-track-card-latitude'}>{getCoordinates(feature.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION, coordinatesFormat)[0]}</FieldValue>
          <FieldName>Longitude</FieldName>
          <FieldValue data-cy={'vessel-track-card-longitude'}>{getCoordinates(feature.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION, coordinatesFormat)[1]}</FieldValue>
        </LatLon>
        <Course>
          <FieldName>Route</FieldName>
          <FieldValue data-cy={'vessel-track-card-course'}>{feature.course === 0 || feature.course
            ? <>{feature.course}°</>
            : <NoValue>-</NoValue>}</FieldValue>
          <FieldName>Vitesse</FieldName>
          <FieldValue data-cy={'vessel-track-card-speed'}>{feature.speed === 0 || feature.speed
            ? <>{feature.speed} Nds</>
            : <NoValue>-</NoValue>}</FieldValue>
        </Course>
        <Position>
          <FieldName>Type de signal</FieldName>
          <FieldValue>{feature.positionType
            ? feature.positionType
            : <NoValue>-</NoValue>}</FieldValue>
          <FieldName>Signal</FieldName>
          <FieldValue>
            {
              feature.dateTime
                ? <>
                  {getDateTime(feature.dateTime, true)}{' '}
                  <Gray>(UTC)</Gray></>
                : <NoValue>-</NoValue>
            }
          </FieldValue>
        </Position>
      </VesselCardBody>
      <TrianglePointer>
        {
          overlayPosition === OverlayPosition.BOTTOM ? <BottomTriangleShadow/> : null
        }
        {
          overlayPosition === OverlayPosition.TOP ? <TopTriangleShadow/> : null
        }
        {
          overlayPosition === OverlayPosition.RIGHT ? <RightTriangleShadow/> : null
        }
        {
          overlayPosition === OverlayPosition.LEFT ? <LeftTriangleShadow/> : null
        }
      </TrianglePointer>
    </>
  )
}

const Gray = styled.span`
  color: ${COLORS.gunMetal};
  font-weight: 300;
`

const TrianglePointer = styled.div`
  margin-left: auto;
  margin-right: auto;
  height: auto;
  width: auto;
`

const BottomTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${COLORS.gainsboro} transparent transparent transparent;
  margin-left: 170px;
  margin-top: -1px;
  clear: top;
`

const TopTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-top: transparent;
  border-right : 6px solid transparent;
  border-bottom : 11px solid ${COLORS.gainsboro};
  border-left : 6px solid transparent;
  margin-left: 170px;
  margin-top: -166px;
  clear: top;
`

const RightTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-right: transparent;
  border-top : 6px solid transparent;
  border-bottom : 6px solid transparent;
  border-left : 11px solid ${COLORS.gainsboro};
  margin-left: 387px;
  margin-top: -134px;
  clear: top;
`

const LeftTriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-top: 6px solid transparent;
  border-right: 11px solid ${COLORS.gainsboro};
  border-bottom: 6px solid transparent;
  border-left: transparent;
  margin-left: -11px;
  margin-top: -74px;
  clear: top;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  margin: 0;
  line-height: normal;
`

const FieldName = styled.div`
  margin-top: 9px;
  color: ${COLORS.slateGray};
  font-size: 13px;
  font-weight: normal;
`

const FieldValue = styled.div`
  color: ${COLORS.gunMetal};
  font-size: 13px;
  font-weight: 500;
  margin-top: 2px;
`

const LatLon = styled.div`
  flex-grow: 1;
  order: 1;
  background: ${COLORS.white};
  margin: 5px 0 5px 5px;
  padding-bottom: 10px;
`

const Course = styled.div`
  flex-grow: 1;
  order: 2;
  background: ${COLORS.white};
  margin: 5px 0 5px 5px;
  padding-bottom: 10px;
`

const Position = styled.div`
  flex-grow: 1;
  order: 3;
  background: ${COLORS.white};
  margin: 5px 5px 5px 5px;
  padding-bottom: 10px;
`

const VesselCardHeader = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 5px 5px 6px 5px;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`

const VesselCardTitle = styled.span`
  margin-left: 5px;
  display: inline-block;
  font-size: 0.9em;
`

const TimeAgo = styled.span`
  float: right;
  margin-right: 5px;
  display: inline-block;
  vertical-align: middle;
  margin-top: 0;
  font-size: 13px;
`

const VesselCardBody = styled.div`
  display: flex;
  flex: 1 1 1;
  text-align: center;
`

export default VesselTrackCard
