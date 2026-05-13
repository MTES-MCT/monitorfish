import { OverlayTrianglePointer } from '@features/Map/components/Overlay/OverlayTrianglePointer'
import { OverlayPosition } from '@features/Map/components/Overlay/types'
import { OPENLAYERS_PROJECTION } from '@features/Map/constants'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled, { useTheme } from 'styled-components'
import * as timeago from 'timeago.js'

import { AIS_CARD_WIDTH, AIS_VESSEL_OVERLAY_CARD_MARGIN } from './constants'
import { extractAISVesselPropertiesFromFeature, getAISShipTypeLabel } from './utils'
import { getCoordinates } from '../../../../coordinates'
import { timeagoFrenchLocale } from '../../../../utils'

import type { AISVessel } from '@features/Vessel/AISVessel.types'

// @ts-expect-error — timeago.js ships no locale type definitions
timeago.register('fr', timeagoFrenchLocale)

type AISVesselCardProps = {
  cardHeight: number
  cardWidth: number
  feature: AISVessel.AISVesselLastPositionFeature
  overlayPosition: OverlayPosition
}
export function AISVesselCard({ cardHeight, cardWidth, feature, overlayPosition }: AISVesselCardProps) {
  const theme = useTheme()
  const coordinatesFormat = useMainAppSelector(state => state.map.coordinatesFormat)

  const vesselProperties = extractAISVesselPropertiesFromFeature(feature, [
    'course',
    'dateTime',
    'destination',
    'flagState',
    'mmsi',
    'imo',
    'ircs',
    'shipType',
    'speed',
    'vesselName'
  ])
  const featureCoordinates = feature.getGeometry()?.getCoordinates() ?? [0, 0]

  return (
    <>
      <CardWrapper>
        <VesselCardHeader>
          {!!vesselProperties.flagState && (
            <>
              <Flag rel="preload" src={`flags/${vesselProperties.flagState.toLowerCase()}.svg`} />{' '}
            </>
          )}
          <VesselCardTitle data-cy="vessel-card-name">
            {vesselProperties.vesselName ?? 'NOM INCONNU'}{' '}
            {vesselProperties.flagState ? <>({vesselProperties.flagState.toUpperCase()})</> : ''}
          </VesselCardTitle>
        </VesselCardHeader>
        <ThreeColumnsBody>
          <LatLon>
            <FieldName>Latitude</FieldName>
            <FieldValue data-cy="vessel-card-latitude">
              {getCoordinates(featureCoordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[0]}
            </FieldValue>
            <FieldName>Longitude</FieldName>
            <FieldValue data-cy="vessel-card-longitude">
              {getCoordinates(featureCoordinates, OPENLAYERS_PROJECTION, coordinatesFormat)[1]}
            </FieldValue>
          </LatLon>
          <Course>
            <FieldName>Route</FieldName>
            <FieldValue>
              <NumericField suffix="°" value={vesselProperties.course} />
            </FieldValue>
            <FieldName>Vitesse</FieldName>
            <FieldValue>
              <NumericField suffix=" Nds" value={vesselProperties.speed} />
            </FieldValue>
          </Course>
          <Position>
            <FieldName>Dernier signal AIS</FieldName>
            <FieldValue>
              {vesselProperties.dateTime ? timeago.format(vesselProperties.dateTime, 'fr') : <NoValue>-</NoValue>}
            </FieldValue>
            <FieldName>Destination</FieldName>
            <FieldValue>{vesselProperties.destination ?? <NoValue>-</NoValue>}</FieldValue>
          </Position>
        </ThreeColumnsBody>
        <Identification>
          <Row>
            <Col>
              <Key>MMSI</Key>
              <Value>{vesselProperties.mmsi}</Value>
            </Col>
            <Col>
              <Key>Call Sign (IRCS)</Key>
              <Value>{vesselProperties.ircs ?? <NoValue>–</NoValue>}</Value>
            </Col>
          </Row>
          <Row>
            <Col>
              <Key>IMO</Key>
              <Value>{vesselProperties.imo ?? <NoValue>–</NoValue>}</Value>
            </Col>
            <Col>
              <Key>Type de navire</Key>
              <Value>
                {vesselProperties.shipType != null ? (
                  (getAISShipTypeLabel(vesselProperties.shipType) ?? <NoValue>–</NoValue>)
                ) : (
                  <NoValue>–</NoValue>
                )}
              </Value>
            </Col>
          </Row>
        </Identification>
      </CardWrapper>
      <OverlayTrianglePointer
        $color={theme.color.gainsboro}
        cardHeight={cardHeight}
        cardWidth={cardWidth}
        margins={AIS_VESSEL_OVERLAY_CARD_MARGIN}
        overlayPosition={overlayPosition}
      />
    </>
  )
}

function NumericField({ suffix, value }: { suffix: string; value: null | number | undefined }) {
  if (value === 0 || value != null) {
    return (
      <>
        {value}
        {suffix}
      </>
    )
  }

  return <NoValue>-</NoValue>
}

const CardWrapper = styled.div`
  width: ${AIS_CARD_WIDTH}px;
  text-align: left;
  background-color: ${p => p.theme.color.gainsboro};
  border-radius: 2px;
  overflow: hidden;
`

const Flag = styled.img<{
  rel?: 'preload'
}>`
  display: inline-block;
  height: 20px;
  vertical-align: middle;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
`

const FieldName = styled.div`
  margin-top: 9px;
  color: ${p => p.theme.color.slateGray};
  font-size: 13px;
  font-weight: 400;
`

const FieldValue = styled.div`
  margin-top: 2px;
  max-height: 20px;
  overflow: clip;
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  font-weight: 500;
`

const LatLon = styled.div`
  width: 122px;
  margin: 5px 0 5px 5px;
  padding-bottom: 10px;
  background: ${p => p.theme.color.white};
`

const Course = styled.div`
  width: 70px;
  margin: 5px 0 5px 5px;
  padding-bottom: 10px;
  background: ${p => p.theme.color.white};
`

const Position = styled.div`
  width: 175px;
  margin: 5px;
  padding: 0 5px 10px;
  background: ${p => p.theme.color.white};
`

const Identification = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 5px 5px;
  padding: 10px;
  background: ${p => p.theme.color.white};
`

const Row = styled.div`
  display: flex;
`

const Col = styled.div`
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: baseline;
`

const Key = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 400;
`

const Value = styled.span`
  overflow: hidden;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const VesselCardHeader = styled.div`
  padding: 4px 5px 5px;
  background: ${p => p.theme.color.charcoal};
  border-radius: 2px 2px 0 0;
  color: ${p => p.theme.color.gainsboro};
`

const VesselCardTitle = styled.span`
  display: inline-block;
  margin-left: 5px;
  font-size: 16px;
  vertical-align: middle;
`

const ThreeColumnsBody = styled.div`
  display: flex;
  text-align: center;
`
