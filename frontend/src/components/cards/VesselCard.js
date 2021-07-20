import React from 'react'
import styled from 'styled-components'
import { getCoordinates, timeagoFrenchLocale } from '../../utils'
import { OPENLAYERS_PROJECTION } from '../../domain/entities/map'
import { COLORS } from '../../constants/constants'
import * as timeago from 'timeago.js'
import { OverlayPosition } from '../overlays/position'
import { useSelector } from 'react-redux'

timeago.register('fr', timeagoFrenchLocale)

const VesselCard = props => {
  const { coordinatesFormat } = useSelector(state => state.map)

  return (
    <>
      <VesselCardHeader>
        {
          props.vessel.getProperties().flagState
            ? <>
              <Flag rel="preload" src={`flags/${props.vessel.getProperties().flagState.toLowerCase()}.svg`}/>{' '}</>
            : null
        }
        <VesselCardTitle>{props.vessel.getProperties().vesselName ? props.vessel.getProperties().vesselName : 'NOM INCONNU'} {props.vessel.getProperties().flagState ? <>({props.vessel.getProperties().flagState})</> : ''}</VesselCardTitle>
        {
          props.vessel.getProperties().lastErsDateTime
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
      <VesselCardBody>
        <LatLon>
          <FieldName>Latitude</FieldName>
          <FieldValue>{getCoordinates(props.vessel.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION, coordinatesFormat)[0]}</FieldValue>
          <FieldName>Longitude</FieldName>
          <FieldValue>{getCoordinates(props.vessel.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION, coordinatesFormat)[1]}</FieldValue>
        </LatLon>
        <Course>
          <FieldName>Route</FieldName>
          <FieldValue>{props.vessel.getProperties().course === 0 || props.vessel.getProperties().course
            ? <>{props.vessel.getProperties().course}°</>
            : <NoValue>-</NoValue>}</FieldValue>
          <FieldName>Vitesse</FieldName>
          <FieldValue>{props.vessel.getProperties().speed === 0 || props.vessel.getProperties().speed
            ? <>{props.vessel.getProperties().speed} Nds</>
            : <NoValue>-</NoValue>}</FieldValue>
        </Course>
        <Position>
          <FieldName>Dernier signal VMS</FieldName>
          <FieldValue>
            {
              props.vessel.getProperties().dateTime
                ? <>{timeago.format(props.vessel.getProperties().dateTime, 'fr')}</>
                : <NoValue>-</NoValue>
            }
          </FieldValue>
          <FieldName>Cadencement</FieldName>
          <FieldValue>
            {
              props.vessel.getProperties().emissionPeriod
                ? <>1 signal toutes les {props.vessel.getProperties().emissionPeriod / 60} min</>
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
                <Value>{props.vessel.getProperties().internalReferenceNumber
                  ? props.vessel.getProperties().internalReferenceNumber
                  : <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key>MMSI</Key>
                <Value>{props.vessel.getProperties().mmsi
                  ? props.vessel.getProperties().mmsi
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
                <Value>{props.vessel.getProperties().externalReferenceNumber
                  ? props.vessel.getProperties().externalReferenceNumber
                  : <NoValue>-</NoValue>}</Value>
              </Field>
              <Field>
                <Key>Call Sign (IRCS)</Key>
                <Value>{props.vessel.getProperties().ircs
                  ? props.vessel.getProperties().ircs
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
                    props.vessel.getProperties().length ? props.vessel.getProperties().length : <NoValue>-</NoValue>
                  }
                  {' '}x{' '}
                  {
                    props.vessel.getProperties().width ? props.vessel.getProperties().width : <NoValue>-</NoValue>
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
          props.overlayPosition === OverlayPosition.BOTTOM ? <BottomTriangleShadow/> : null
        }
        {
          props.overlayPosition === OverlayPosition.TOP ? <TopTriangleShadow/> : null
        }
        {
          props.overlayPosition === OverlayPosition.RIGHT ? <RightTriangleShadow/> : null
        }
        {
          props.overlayPosition === OverlayPosition.LEFT ? <LeftTriangleShadow/> : null
        }
      </TrianglePointer>
    </>
  )
}

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
  color: ${COLORS.charcoal};
  margin: 3px 7px 7px 3px;
  height: 17px;
  padding: 3px 5px 0px 2px;
  right: 0;
  position: absolute;
  display: inline;
`

const Flag = styled.img`
    font-size: 1.5em;
    display: inline-block;
    vertical-align: middle;
    height: 24px;
    margin-top: -5px;
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
  color: ${COLORS.charcoal};
  font-weight: medium;
  margin: 0;
  text-align: left;
  padding: 0 0 0 5px;
  background: none;
  border: none;
  line-height: normal;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 95px;
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
  margin-left: 179px;
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
  margin-left: 179px;
  margin-top: -267px;
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
  margin-left: 385px;
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
  margin-top: -134px;
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
  color: ${COLORS.charcoal};
  font-size: 13px;
  font-weight: medium;
  margin-top: 2px;
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
  margin-top: -5px;
`

const VesselCardBody = styled.div`
  display: flex;
  text-align: center;
`

export default VesselCard
