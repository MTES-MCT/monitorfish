import React from "react";
import styled from 'styled-components';
import {getCoordinates, timeagoFrenchLocale} from "../../utils";
import {OPENLAYERS_PROJECTION} from "../../domain/entities/map";
import {COLORS} from "../../constants/constants";
import * as timeago from 'timeago.js';
timeago.register('fr', timeagoFrenchLocale);

const VesselCard = props => {
    return (
        <>
            <VesselCardHeader>
                {
                    props.vessel.getProperties().flagState ? <>
                        <Flag rel="preload" src={`flags/${props.vessel.getProperties().flagState.toLowerCase()}.svg`} />{' '}</> : null
                }
                <VesselCardTitle>{props.vessel.getProperties().vesselName ? props.vessel.getProperties().vesselName : 'NOM INCONNU'} {props.vessel.getProperties().flagState ? <>({props.vessel.getProperties().flagState})</> : ''}</VesselCardTitle>
            </VesselCardHeader>
            <VesselCardBody>
                <LatLon>
                    <FieldName>Latitude</FieldName>
                    <FieldValue>{getCoordinates(props.vessel.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION)[0]}</FieldValue>
                    <FieldName>Longitude</FieldName>
                    <FieldValue>{getCoordinates(props.vessel.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION)[1]}</FieldValue>
                </LatLon>
                <Course>
                    <FieldName>Route</FieldName>
                    <FieldValue>{props.vessel.getProperties().course === 0 || props.vessel.getProperties().course ? <>{props.vessel.getProperties().course}°</> : <NoValue>-</NoValue>}</FieldValue>
                    <FieldName>Vitesse</FieldName>
                    <FieldValue>{props.vessel.getProperties().speed === 0 || props.vessel.getProperties().speed ? <>{props.vessel.getProperties().speed} Nds</> : <NoValue>-</NoValue>}</FieldValue>
                </Course>
                <Position>
                    <FieldName>Type de signal</FieldName>
                    <FieldValue>{props.vessel.getProperties().positionType ? props.vessel.getProperties().positionType : <NoValue>-</NoValue>}</FieldValue>
                    <FieldName>Dernier signal</FieldName>
                    <FieldValue>
                        {
                            props.vessel.getProperties().dateTime ? <>{timeago.format(props.vessel.getProperties().dateTime, 'fr')}</>
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
                                <Value>{props.vessel.getProperties().internalReferenceNumber ? props.vessel.getProperties().internalReferenceNumber : <NoValue>-</NoValue>}</Value>
                            </Field>
                            <Field>
                                <Key>MMSI</Key>
                                <Value>{props.vessel.getProperties().mmsi ? props.vessel.getProperties().mmsi : <NoValue>-</NoValue>}</Value>
                            </Field>
                        </Body>
                    </Fields>
                </ColumnOne>
                <ColumnTwo>
                    <Fields>
                        <Body>
                            <Field>
                                <Key>Marquage ext.</Key>
                                <Value>{props.vessel.getProperties().externalReferenceNumber ? props.vessel.getProperties().externalReferenceNumber : <NoValue>-</NoValue>}</Value>
                            </Field>
                            <Field>
                                <Key>Call Sign (IRCS)</Key>
                                <Value>{props.vessel.getProperties().ircs ? props.vessel.getProperties().ircs : <NoValue>-</NoValue>}</Value>
                            </Field>
                        </Body>
                    </Fields>
                </ColumnTwo>
            </VesselCardBottom>
            <TrianglePointer>
                <TriangleShadow />
            </TrianglePointer>
        </>
    )
}

const Flag = styled.img`
    font-size: 1.5em;
    margin-left: 5px;
    display: inline-block;
    width: 1em;                      
    height: 1em;                      
    vertical-align: middle;
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
  color: ${COLORS.textGray};
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
  color: ${COLORS.grayDarkerThree};
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

const TriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 11px 6px 0 6px;
  border-color: ${COLORS.grayBackground} transparent transparent transparent;
  margin-left: 179px;
  margin-top: -1px;
  clear: top;
`

const NoValue = styled.span`
  color: ${COLORS.textGray};
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
  color: ${COLORS.textGray};
  font-size: 13px;
  font-weight: normal;
`

const FieldValue = styled.div`
  color: ${COLORS.grayDarkerThree};
  font-size: 13px;
  font-weight: medium;
  margin-top: 2px;
`

const LatLon = styled.div`
  width: 120px;
  order: 1;
  background: ${COLORS.background};
  margin: 5px 0 5px 5px;
  padding-bottom: 10px;
`

const Course = styled.div`
  width: 115px;
  order: 2;
  background: ${COLORS.background};
  margin: 5px 0 5px 5px;
  padding-bottom: 10px;
`

const Position = styled.div`
  width: 115px;
  order: 3;
  background: ${COLORS.background};
  margin: 5px 5px 5px 5px;
  padding-bottom: 10px;
  padding-left: 5px;
  padding-right: 5px;
`

const VesselCardHeader = styled.div`
  background: ${COLORS.grayDarkerThree};
  color: ${COLORS.grayBackground};
  padding: 4px 5px 5px 5px;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
`

const VesselCardTitle = styled.span`
  margin-left: 5px;
  display: inline-block;
  vertical-align: middle;
`

const VesselCardBody = styled.div`
  display: flex;
  text-align: center;
`

export default VesselCard
