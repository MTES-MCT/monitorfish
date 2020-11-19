import React from "react";
import styled from 'styled-components';
import {getDateTime, getCoordinates} from "../utils";

const VesselTrackCard = props => {
    return (
        <>
            <VesselCardHeader>
                <VesselCardTitle>POSITION</VesselCardTitle>
            </VesselCardHeader>
            <VesselCardBody>
                <LatLon>
                    <FieldName>LATITUDE</FieldName>
                    <FieldValue>{getCoordinates(props.vessel.getGeometry().getCoordinates())[0]}</FieldValue>
                    <FieldName>LONGITUDE</FieldName>
                    <FieldValue>{getCoordinates(props.vessel.getGeometry().getCoordinates())[1]}</FieldValue>
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
  margin-top: 5px;
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
  margin-top: 5px;
  clear: top;

`

const NoValue = styled.span`
  color: grey;
  font-weight: 300;
`

const Gray = styled.span`
  color: gray;
  font-weight: 300;
`

const FieldName = styled.div`
  margin-top: 2px;
  color: gray;
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
  text-align: center;
  background: rgba(5, 5, 94, 0.1);
  padding: 2px 5px 2px 5px;
  border-bottom: 1px rgba(5, 5, 94, 0.1) solid;
`

const VesselCardTitle = styled.span`
  margin-left: 5px;
  display: inline-block;
  vertical-align: middle;
  font-size: 0.9em;
`

const VesselCardBody = styled.div`
  display: flex;
  text-align: center;
`

export default VesselTrackCard
