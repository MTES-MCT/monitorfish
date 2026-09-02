import { OverlayPosition } from '@features/Map/components/Overlay/types.ts'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { getCoordinates, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { getDateTime, timeagoFrenchLocale } from '../../../../utils'
import { OPENLAYERS_PROJECTION } from '../../constants'

timeago.register('fr', timeagoFrenchLocale)

export function VesselTrackCard({ feature, overlayPosition }) {
  const { coordinatesFormat } = useMainAppSelector(state => state.map)

  return (
    <>
      <VesselCardHeader>
        <VesselCardTitle>POSITION</VesselCardTitle>
        <TimeAgo>{feature.dateTime ? <>{timeago.format(feature.dateTime, 'fr')}</> : <NoValue>-</NoValue>}</TimeAgo>
      </VesselCardHeader>
      <VesselCardBody>
        <LatLon>
          <FieldName>Latitude</FieldName>
          <FieldValue data-cy="vessel-track-card-latitude">
            {getCoordinates(feature.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION, coordinatesFormat)[0]}
          </FieldValue>
          <FieldName>Longitude</FieldName>
          <FieldValue data-cy="vessel-track-card-longitude">
            {getCoordinates(feature.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION, coordinatesFormat)[1]}
          </FieldValue>
        </LatLon>
        <Course>
          <FieldName>Route</FieldName>
          <FieldValue data-cy="vessel-track-card-course">
            {feature.course === 0 || feature.course ? <>{feature.course}°</> : <NoValue>-</NoValue>}
          </FieldValue>
          <FieldName>Vitesse</FieldName>
          <FieldValue data-cy="vessel-track-card-speed">
            {feature.speed === 0 || feature.speed ? <>{feature.speed} Nds</> : <NoValue>-</NoValue>}
          </FieldValue>
        </Course>
        <Position>
          <FieldName>Type de signal</FieldName>
          <FieldValue>{feature.positionType ? feature.positionType : <NoValue>-</NoValue>}</FieldValue>
          <FieldName>Signal</FieldName>
          <FieldValue>
            {feature.dateTime ? (
              <>
                {getDateTime(feature.dateTime, true)} <Gray>(UTC)</Gray>
              </>
            ) : (
              <NoValue>-</NoValue>
            )}
          </FieldValue>
        </Position>
      </VesselCardBody>
      <TrianglePointer>
        {overlayPosition === OverlayPosition.BOTTOM ? <BottomTriangleShadow /> : null}
        {overlayPosition === OverlayPosition.TOP ? <TopTriangleShadow /> : null}
        {overlayPosition === OverlayPosition.RIGHT ? <RightTriangleShadow /> : null}
        {overlayPosition === OverlayPosition.LEFT ? <LeftTriangleShadow /> : null}
      </TrianglePointer>
    </>
  )
}

const Gray = styled.span`
  color: ${THEME.color.gunMetal};
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
  border-color: ${THEME.color.gainsboro} transparent transparent transparent;
  margin-left: 170px;
  margin-top: -1px;
  clear: top;
`

const TopTriangleShadow = styled.div`
  clear: top;
  border-top: transparent;
  border-right: 6px solid transparent;
  border-bottom: 11px solid ${THEME.color.gainsboro};
  border-left: 6px solid transparent;
  height: 0;
  margin-left: 170px;
  margin-top: -166px;
  position: absolute;
  width: 0;
`

const RightTriangleShadow = styled.div`
  border-right: transparent;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 11px solid ${THEME.color.gainsboro};
  clear: top;
  height: 0;
  margin-left: 387px;
  margin-top: -134px;
  position: absolute;
  width: 0;
`

const LeftTriangleShadow = styled.div`
  border-style: solid;
  border-top: 6px solid transparent;
  border-right: 11px solid ${THEME.color.gainsboro};
  border-bottom: 6px solid transparent;
  border-left: transparent;
  clear: top;
  height: 0;
  margin-left: -11px;
  margin-top: -74px;
  position: absolute;
  width: 0;
`

const NoValue = styled.span`
  color: ${THEME.color.slateGray};
  font-weight: 300;
  line-height: normal;
  margin: 0;
`

const FieldName = styled.div`
  color: ${THEME.color.slateGray};
  font-size: 13px;
  font-weight: normal;
  margin-top: 9px;
`

const FieldValue = styled.div`
  color: ${THEME.color.gunMetal};
  font-size: 13px;
  font-weight: 500;
  margin-top: 2px;
`

const LatLon = styled.div`
  background: ${THEME.color.white};
  flex-grow: 1;
  margin: 5px 0 5px 5px;
  order: 1;
  padding-bottom: 10px;
`

const Course = styled.div`
  background: ${THEME.color.white};
  flex-grow: 1;
  order: 2;
  margin: 5px 0 5px 5px;
  padding-bottom: 10px;
`

const Position = styled.div`
  background: ${THEME.color.white};
  flex-grow: 1;
  margin: 5px 5px 5px 5px;
  order: 3;
  padding-bottom: 10px;
`

const VesselCardHeader = styled.div`
  background: ${THEME.color.charcoal};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  color: ${THEME.color.gainsboro};
  padding: 5px 5px 6px 5px;
`

const VesselCardTitle = styled.span`
  display: inline-block;
  font-size: 0.9em;
  margin-left: 5px;
`

const TimeAgo = styled.span`
  display: inline-block;
  float: right;
  font-size: 13px;
  margin-right: 5px;
  margin-top: 0;
  vertical-align: middle;
`

const VesselCardBody = styled.div`
  display: flex;
  flex: 1 1 1;
  text-align: center;
`
