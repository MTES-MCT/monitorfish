import React from "react";
import styled from 'styled-components';
import ReactCountryFlag from "react-country-flag";
import {getDateTime, getCoordinates} from "../utils";
import {OPENLAYERS_PROJECTION} from "../domain/entities/map";
import {COLORS} from "../constants/constants";

const VesselCard = props => {
    return (
        <>
            <VesselCardHeader>
                {
                    props.vessel.getProperties().flagState ? <><ReactCountryFlag countryCode={props.vessel.getProperties().flagState} style={{fontSize: '1.5em', marginLeft: '5px'}}/>{' '}</> : null
                }
                <VesselCardTitle>{props.vessel.getProperties().vesselName ? props.vessel.getProperties().vesselName : 'NOM INCONNU'} {props.vessel.getProperties().flagState ? <>({props.vessel.getProperties().flagState})</> : ''}</VesselCardTitle>
            </VesselCardHeader>
            <VesselCardBody>
                <LatLon>
                    <FieldName>LATITUDE</FieldName>
                    <FieldValue>{getCoordinates(props.vessel.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION)[0]}</FieldValue>
                    <FieldName>LONGITUDE</FieldName>
                    <FieldValue>{getCoordinates(props.vessel.getGeometry().getCoordinates(), OPENLAYERS_PROJECTION)[1]}</FieldValue>
                </LatLon>
                <Course>
                    <FieldName>ROUTE</FieldName>
                    <FieldValue>{props.vessel.getProperties().course ? <>{props.vessel.getProperties().course}°</> : <NoValue>-</NoValue>}</FieldValue>
                    <FieldName>VITESSE</FieldName>
                    <FieldValue>{props.vessel.getProperties().speed ? <>{props.vessel.getProperties().speed} Nds</> : <NoValue>-</NoValue>}</FieldValue>
                </Course>
                <Position>
                    <FieldName>TYPE DE SIGNAL</FieldName>
                    <FieldValue>{props.vessel.getProperties().positionType ? props.vessel.getProperties().positionType : <NoValue>-</NoValue>}</FieldValue>
                    <FieldName>DERNIER SIGNAL</FieldName>
                    <FieldValue>
                        {
                            props.vessel.getProperties().dateTime ? <>
                                    {getDateTime(props.vessel.getProperties().dateTime)}{' '}
                                    <Gray>CET</Gray></>
                                : <NoValue>-</NoValue>
                        }

                    </FieldValue>
                </Position>
            </VesselCardBody>
            <VesselCardBottom>
                <ColumnOne>
                    <Row>
                        <BottomFieldName>CFR</BottomFieldName>
                        <BottomFieldValue>{props.vessel.getProperties().internalReferenceNumber ? props.vessel.getProperties().internalReferenceNumber : <NoValue>-</NoValue>}</BottomFieldValue>
                    </Row>
                    <Row>
                        <BottomFieldName>XR</BottomFieldName>
                        <BottomFieldValue>{props.vessel.getProperties().externalReferenceNumber ? props.vessel.getProperties().externalReferenceNumber : <NoValue>-</NoValue>}</BottomFieldValue>
                    </Row>
                </ColumnOne>
                <ColumnTwo>
                    <Row>
                        <BottomFieldName>MMSI</BottomFieldName>
                        <BottomFieldValue>{props.vessel.getProperties().MMSI ? props.vessel.getProperties().MMSI : <NoValue>-</NoValue>}</BottomFieldValue>
                    </Row>
                    <Row>
                        <BottomFieldName>CALL SIGN</BottomFieldName>
                        <BottomFieldValue>{props.vessel.getProperties().IRCS ? props.vessel.getProperties().IRCS : <NoValue>-</NoValue>}</BottomFieldValue>
                    </Row>
                </ColumnTwo>
            </VesselCardBottom>
            <TrianglePointer>
                <TriangleShadow />
                <Triangle />
            </TrianglePointer>
        </>
    )
}

const TrianglePointer = styled.div`
  margin-left:auto;
  margin-right:auto;
  height:auto; 
  width:auto;
`

const TriangleShadow = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 17px 9px 0 9px;
  border-color: rgba(5, 5, 94, 0.3) transparent transparent transparent;
  margin-left: 43.7%;
  margin-top: -1px;
  clear: top;
`

const Triangle = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 15px 8.5px 0 8.5px;
  border-color: white transparent transparent transparent;
  margin-left: 44%;
  margin-top: -1px;
  clear: top;

`

const NoValue = styled.span`
  color: ${COLORS.textGray};
  font-weight: 300;
`

const Row = styled.div`
  margin-top: -5px;
`

const BottomFieldName = styled.span`
  color: ${COLORS.textGray};
  font-size: 0.8em;
`

const BottomFieldValue = styled.span`
  margin-left: 5px;
  font-size: 0.8em;
  font-weight: 500;
`

const ColumnOne = styled.div`
  width: 50%;
  order: 1;
  padding: 10px 5px 5px 15px;
`

const ColumnTwo = styled.div`
  width: 50%;
  order: 2;
  padding: 10px 5px 5px 15px;
`

const VesselCardBottom = styled.div`
  border-top: 1px rgba(5, 5, 94, 0.1) solid;
  display: flex
`

const Gray = styled.span`
  color: ${COLORS.textGray};
  font-weight: 300;
`

const FieldName = styled.div`
  margin-top: 2px;
  color: ${COLORS.textGray};
  font-size: 0.8em;
`

const FieldValue = styled.div`
  font-size: 0.8em;
  font-weight: 500;
`

const LatLon = styled.div`
  width: 120px;
  order: 1;
  border-right: 1px rgba(5, 5, 94, 0.1) solid;
  padding: 5px 5px 5px 5px;
`

const Course = styled.div`
  width: 100px;
  order: 2;
  border-right: 1px rgba(5, 5, 94, 0.1) solid;
  padding: 5px 5px 5px 5px;
`

const Position = styled.div`
  width: 210px;
  order: 3;
  padding: 5px 5px 5px 5px;
`

const VesselCardHeader = styled.div`
  background: rgba(5, 5, 94, 0.1);
  padding: 5px 5px 5px 5px;
  border-bottom: 1px rgba(5, 5, 94, 0.1) solid;
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
