import React from "react";
import styled from 'styled-components';
import {getCoordinates, getDateTime, timeagoFrenchLocale} from "../utils";
import {OPENLAYERS_PROJECTION} from "../domain/entities/map";
import {COLORS} from "../constants/constants";
import * as timeago from 'timeago.js';
timeago.register('fr', timeagoFrenchLocale);

const VesselTrackCard = props => {
    return (
        <>
            <VesselCardHeader>
                <VesselCardTitle>POSITION</VesselCardTitle>
                <TimeAgo>
                    {
                        props.vessel.getProperties().dateTime ? <>
                                {timeago.format(props.vessel.getProperties().dateTime, 'fr')}</>
                            : <NoValue>-</NoValue>
                    }
                </TimeAgo>
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
                    <FieldValue>{props.vessel.getProperties().course ? <>{props.vessel.getProperties().course}°</> : <NoValue>-</NoValue>}</FieldValue>
                    <FieldName>Vitesse</FieldName>
                    <FieldValue>{props.vessel.getProperties().speed ? <>{props.vessel.getProperties().speed} Nds</> : <NoValue>-</NoValue>}</FieldValue>
                </Course>
                <Position>
                    <FieldName>Type de signal</FieldName>
                    <FieldValue>{props.vessel.getProperties().positionType ? props.vessel.getProperties().positionType : <NoValue>-</NoValue>}</FieldValue>
                    <FieldName>Dernier signal</FieldName>
                    <FieldValue>
                        {
                            props.vessel.getProperties().dateTime ? <>
                                    {getDateTime(props.vessel.getProperties().dateTime, true)}{' '}
                                    <Gray>(CET)</Gray></>
                                : <NoValue>-</NoValue>
                        }
                    </FieldValue>
                </Position>
            </VesselCardBody>
            <TrianglePointer>
                <TriangleShadow />
            </TrianglePointer>
        </>
    )
}

const Gray = styled.span`
  color: ${COLORS.textGray};
  font-weight: 300;
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
  margin-left: 170px;
  margin-top: -1px;
  clear: top;
`

const NoValue = styled.span`
  color: ${COLORS.textGray};
  font-weight: 300;
  margin: 0;
  line-height: normal;
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
  width: 100px;
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
  width: 160px;
  order: 3;
  background: ${COLORS.background};
  margin: 5px 5px 5px 5px;
  padding-bottom: 10px;
`

const VesselCardHeader = styled.div`
  background: ${COLORS.grayDarkerThree};
  color: ${COLORS.grayBackground};
  padding: 4px 5px 6px 5px;
`

const VesselCardTitle = styled.span`
  margin-left: 5px;
  display: inline-block;
  vertical-align: middle;
  font-size: 0.9em;
`

const TimeAgo = styled.span`
  float: right;
  margin-right: 5px;
  display: inline-block;
  vertical-align: middle;
  margin-top: 4px;
  font-size: 13px;
`

const VesselCardBody = styled.div`
  display: flex;
  text-align: center;
`

export default VesselTrackCard
