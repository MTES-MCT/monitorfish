import React from 'react'
import styled from 'styled-components'
import { getCoordinates } from '../../../coordinates'
import { timeagoFrenchLocale } from '../../../utils'
import { OPENLAYERS_PROJECTION } from '../../../domain/entities/map'
import { COLORS } from '../../../constants/constants'
import * as timeago from 'timeago.js'
import { OverlayPosition } from '../overlays/position'
import { useSelector } from 'react-redux'
import { ReactComponent as AlertSVG } from '../../icons/Icone_alertes.svg'
import { AlertTypes } from '../../../domain/entities/alerts'
import { marginsWithoutAlert, marginsWithAlert } from '../overlays/VesselCardOverlay'

timeago.register('fr', timeagoFrenchLocale)

const VesselCard = ({ feature, overlayPosition, hasAlert }) => {
  const { coordinatesFormat } = useSelector(state => state.map)

  return (
    <>
      <VesselCardHeader>
        {
          feature.vessel.flagState
            ? <>
              <Flag rel="preload" src={`flags/${feature.vessel.flagState.toLowerCase()}.svg`}/>{' '}</>
            : null
        }
        <VesselCardTitle data-cy={'vessel-card-name'}>
          {
            feature.vessel.vesselName
              ? feature.vessel.vesselName
              : 'NOM INCONNU'
          }{' '}
          {
            feature.vessel.flagState
              ? <>({feature.vessel.flagState})</>
              : ''
          }
        </VesselCardTitle>
        {
          feature.vessel.lastErsDateTime
            ? <ERS>
              <ERSOK/>
              <MessageText>JPE</MessageText>
            </ERS>
            : <ERS>
              <NoERS/>
              <MessageText>JPE</MessageText>
            </ERS>
        }
      </VesselCardHeader>
      {
        feature?.vessel?.alerts?.length
          ? <VesselCardAlerts>
            <AlertIcon/>
            {
              feature?.vessel?.alerts?.length === 1
                ? AlertTypes[feature?.vessel?.alerts[0]].name
                : `${feature?.vessel?.alerts?.length} alertes`
            }
          </VesselCardAlerts>
          : null
      }

      <VesselCardBody>
        <LatLon>
          <FieldName>Latitude</FieldName>
          <FieldValue data-cy={'vessel-card-latitude'}>{getCoordinates(feature.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION, coordinatesFormat)[0]}</FieldValue>
          <FieldName>Longitude</FieldName>
          <FieldValue data-cy={'vessel-card-longitude'}>{getCoordinates(feature.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION, coordinatesFormat)[1]}</FieldValue>
        </LatLon>
        <Course>
          <FieldName>Route</FieldName>
          <FieldValue>{feature.vessel.course === 0 || feature.vessel.course
            ? <>{feature.vessel.course}°</>
            : <NoValue>-</NoValue>}</FieldValue>
          <FieldName>Vitesse</FieldName>
          <FieldValue>{feature.vessel.speed === 0 || feature.vessel.speed
            ? <>{feature.vessel.speed} Nds</>
            : <NoValue>-</NoValue>}</FieldValue>
        </Course>
        <Position>
          <FieldName>Dernier signal VMS</FieldName>
          <FieldValue>
            {
              feature.vessel.dateTime
                ? <>{timeago.format(feature.vessel.dateTime, 'fr')}</>
                : <NoValue>-</NoValue>
            }
          </FieldValue>
          <FieldName>Cadencement</FieldName>
          <FieldValue>
            {
              feature.vessel.emissionPeriod
                ? <>1 signal toutes les {feature.vessel.emissionPeriod / 60} min</>
                : <NoValue>-</NoValue>
            }
          </FieldValue>
        </Position>
      </VesselCardBody>
      <VesselCardBottom>
        <ColumnOne>
          <Fields>
            <Body>
              <Field>
                <Key>CFR</Key>
                <Value data-cy={'vessel-card-internal-reference-number'}>{feature.vessel.internalReferenceNumber
                  ? feature.vessel.internalReferenceNumber
                  : <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key>MMSI</Key>
                <Value data-cy={'vessel-card-mmsi'}>{feature.vessel.mmsi
                  ? feature.vessel.mmsi
                  : <NoValue>-</NoValue>}</Value>
              </Field>
            </Body>
          </Fields>
        </ColumnOne>
        <ColumnTwo>
          <Fields>
            <Body>
              <Field>
                <Key>Marquage ext.</Key>
                <Value data-cy={'vessel-card-external-reference-number'}>{feature.vessel.externalReferenceNumber
                  ? feature.vessel.externalReferenceNumber
                  : <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key>Call Sign (IRCS)</Key>
                <Value data-cy={'vessel-card-ircs'}>{feature.vessel.ircs
                  ? feature.vessel.ircs
                  : <NoValue>-</NoValue>}</Value>
              </Field>
            </Body>
          </Fields>
        </ColumnTwo>
      </VesselCardBottom>
      <VesselCardBottom>
        <ColumnOne>
          <Fields>
            <Body>
              <Field>
                <Key>Taille du navire</Key>
                <Value>
                  {
                    feature.vessel.length ? feature.vessel.length : <NoValue>-</NoValue>
                  }
                  {' '}x{' '}
                  {
                    feature.vessel.width ? feature.vessel.width : <NoValue>-</NoValue>
                  }
                  {' '}m
                </Value>
              </Field>
            </Body>
          </Fields>
        </ColumnOne>

      </VesselCardBottom>
      <TrianglePointer>
        {
          overlayPosition === OverlayPosition.BOTTOM ? <BottomTriangleShadow hasAlert={hasAlert}/> : null
        }
        {
          overlayPosition === OverlayPosition.TOP ? <TopTriangleShadow hasAlert={hasAlert}/> : null
        }
        {
          overlayPosition === OverlayPosition.RIGHT ? <RightTriangleShadow hasAlert={hasAlert}/> : null
        }
        {
          overlayPosition === OverlayPosition.LEFT ? <LeftTriangleShadow hasAlert={hasAlert}/> : null
        }
      </TrianglePointer>
    </>
  )
}

const AlertIcon = styled(AlertSVG)`
  width: 18px;
  height: 18px;
  margin-bottom: -4px;
  margin-right: 5px;
`

const VesselCardAlerts = styled.div`
  background: #E1000F;
  font-weight: 500;
  font-size: 13px;
  color: #FFFFFF;
  text-transform: uppercase;
  width: 100%;
  text-align: center;
  padding: 5px 0;
`

const MessageText = styled.span`
  vertical-align: text-top;
  line-height: 11px;
  margin: 0 3px 0 3px;
`

const NoERS = styled.span`
  height: 14px;
  margin-left: 3px;
  width: 14px;
  background-color: #E1000F;
  border-radius: 50%;
  display: inline-block;
`

const ERSOK = styled.span`
  height: 14px;
  margin-left: 3px;
  width: 14px;
  background-color: #8CC61F;
  border-radius: 50%;
  display: inline-block;
`

const ERS = styled.span`
  border-radius: 11px;
  background: ${COLORS.gainsboro};
  font-size: 11px;
  color: ${COLORS.gunMetal};
  margin: 3px 7px 7px 3px;
  height: 17px;
  padding: 3px 5px 0px 2px;
  right: 0;
  position: absolute;
  display: inline;
`

const Flag = styled.img`
  height: 20px;
  display: inline-block;
  vertical-align: middle;
  margin-top: 0px;
`

const Body = styled.tbody``

const Fields = styled.table`
  width: inherit;
  display: table;
  margin: 0;
  padding-bottom: 0;
`

const Field = styled.tr`
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${COLORS.slateGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 8px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const Value = styled.td`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  font-weight: 500;
  margin: 0;
  text-align: left;
  padding: 0 0 0 5px;
  background: none;
  border: none;
  line-height: normal;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 100px;
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
  margin-left: ${props => -(props.hasAlert ? marginsWithAlert.xMiddle : marginsWithoutAlert.xMiddle) - 6}px;
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
  margin-left: ${props => -(props.hasAlert ? marginsWithAlert.xMiddle : marginsWithoutAlert.xMiddle) - 6}px;
  margin-top: ${props => (props.hasAlert ? marginsWithAlert.yBottom : marginsWithoutAlert.yBottom) + 10}px;
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
  margin-left: ${props => -(props.hasAlert ? marginsWithAlert.xRight : marginsWithoutAlert.xRight) - 20}px;
  margin-top: ${props => (props.hasAlert ? marginsWithAlert.yMiddle : marginsWithoutAlert.yMiddle) - 6}px;
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
  margin-top: ${props => (props.hasAlert ? marginsWithAlert.yMiddle : marginsWithoutAlert.yMiddle) - 6}px;
  clear: top;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  margin: 0;
  line-height: normal;
`

const ColumnOne = styled.div`
  order: 1;
  padding: 10px 0 0 5px;
  margin-bottom: 5px;
  min-width: 100px;
`

const ColumnTwo = styled.div`
  order: 2;
  padding: 10px 5px 0 5px;
  margin-bottom: 5px;
`

const VesselCardBottom = styled.div`
  display: flex;
  background: ${COLORS.background};
  margin: 0 5px 5px 5px;
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
  max-height: 20px;
  overflow: clip;
`

const LatLon = styled.div`
  width: 122px;
  order: 1;
  background: ${COLORS.background};
  margin: 5px 0 5px 5px;
  padding-bottom: 10px;
`

const Course = styled.div`
  width: 70px;
  order: 2;
  background: ${COLORS.background};
  margin: 5px 0 5px 5px;
  padding-bottom: 10px;
`

const Position = styled.div`
  width: 175px;
  order: 3;
  background: ${COLORS.background};
  margin: 5px 5px 5px 5px;
  padding-bottom: 10px;
  padding-left: 5px;
  padding-right: 5px;
`

const VesselCardHeader = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 4px 5px 5px 5px;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`

const VesselCardTitle = styled.span`
  margin-left: 5px;
  display: inline-block;
  vertical-align: middle;
  margin-top: 0px;
  font-size: 16px;
`

const VesselCardBody = styled.div`
  display: flex;
  text-align: center;
`

export default VesselCard
