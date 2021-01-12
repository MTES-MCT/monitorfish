import React, {useEffect, useState} from "react";
import styled from 'styled-components';
import { FingerprintSpinner } from 'react-epic-spinners'
import {ReactComponent as NoVesselSVG} from '../components/icons/Picto_photo_navire_manquante.svg';

import {getCoordinates, timeagoFrenchLocale} from "../utils";
import {WSG84_PROJECTION} from "../domain/entities/map";
import {COLORS} from "../constants/constants";
import * as timeago from 'timeago.js';
timeago.register('fr', timeagoFrenchLocale);

const VesselSummary = props => {
    const [photoFallback, setPhotoFallback] = useState(false)
    const [vessel, setVessel] = useState(null);
    const [lastPosition, setLastPosition] = useState(null);
    const [gears, setGears] = useState([])

    useEffect(() => {
        if (props.vessel) {
            setVessel(props.vessel)
            setLastPosition(props.vessel.positions[props.vessel.positions.length - 1])

            if(props.vessel.mmsi) {
                setPhotoFallback(false)
            } else {
                setPhotoFallback(true)
            }
        }
    }, [props.vessel])

    useEffect(() => {
        if(props.gears && props.vessel && props.vessel.declaredFishingGears) {
            const gears = props.vessel.declaredFishingGears.map(declaredGearCode => {
                let foundGear = props.gears.find(gear => gear.code === declaredGearCode)
                return {
                    name: foundGear ? foundGear.name : null,
                    code: declaredGearCode
                }
            })

            setGears(gears)
        }
    }, [props.gears, props.vessel])

    return vessel ? (
        <Body>
            <PhotoZone>
                {
                    photoFallback ?
                        <NoVessel /> :
                        <>
                            {
                                props.vessel.mmsi ? <Photo referrerpolicy="no-referrer" onError={() => setPhotoFallback(true)} src={`https://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=${props.vessel.mmsi}&size=thumb300`}/>
                                    : null
                            }
                        </>
                }
            </PhotoZone>
            <ZoneWithoutBackground>
                <LatLon>
                    <FieldName>Latitude</FieldName>
                    <FieldValue>{getCoordinates([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION)[0]}</FieldValue>
                    <FieldName>Longitude</FieldName>
                    <FieldValue>{getCoordinates([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION)[1]}</FieldValue>
                </LatLon>
                <Course>
                    <FieldName>Route</FieldName>
                    <FieldValue>{lastPosition.course ? <>{lastPosition.course}°</> : <NoValue>-</NoValue>}</FieldValue>
                    <FieldName>Vitesse</FieldName>
                    <FieldValue>{lastPosition.speed ? <>{lastPosition.speed} Nds</> : <NoValue>-</NoValue>}</FieldValue>
                </Course>
                <Position>
                    <FieldName>Type de signal</FieldName>
                    <FieldValue>{lastPosition.positionType ? lastPosition.positionType : <NoValue>-</NoValue>}</FieldValue>
                    <FieldName>Dernier signal</FieldName>
                    <FieldValue>
                        {
                            lastPosition.dateTime ? <>{timeago.format(lastPosition.dateTime, 'fr')}</>
                                : <NoValue>-</NoValue>
                        }

                    </FieldValue>
                </Position>
            </ZoneWithoutBackground>
            <Zone>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>CFR</Key>
                            <Value>{props.vessel.internalReferenceNumber ? props.vessel.internalReferenceNumber : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>MMSI</Key>
                            <Value>{props.vessel.mmsi ? props.vessel.mmsi : <NoValue>-</NoValue>}</Value>
                        </Field>
                    </TableBody>
                </Fields>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>Marquage ext.</Key>
                            <Value>{props.vessel.externalReferenceNumber ? props.vessel.externalReferenceNumber : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Call Sign (IRCS)</Key>
                            <Value>{props.vessel.ircs ? props.vessel.ircs : <NoValue>-</NoValue>}</Value>
                        </Field>
                    </TableBody>
                </Fields>
            </Zone>
            <Zone>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>Segment de flotte</Key>
                            <TrimmedValue>{props.vessel.fleetSegment ? props.vessel.fleetSegment : <NoValue>à venir</NoValue>}</TrimmedValue>
                        </Field>
                        <Field>
                            <Key>Engins à bord (PME)</Key>
                            <Value>
                                {
                                    gears ?
                                        gears.map(gear => {
                                            return gear.name ?
                                                <ValueWithLineBreak key={gear.code}>{gear.name} ({gear.code})</ValueWithLineBreak>
                                                : <ValueWithLineBreak key={gear.code}>{gear.code}</ValueWithLineBreak>

                                        }) : <NoValue>-</NoValue>
                                }
                            </Value>
                        </Field>
                        <Field>
                            <Key>Zones de la marée</Key>
                            <TrimmedValue><NoValue>à venir</NoValue></TrimmedValue>
                        </Field>
                    </TableBody>
                </Fields>
            </Zone>
            <Zone>
                <Fields>
                    <BodyWithoutTopPadding>
                        <Field>
                            <Key>Message DEP</Key>
                            <Value><NoValue>à venir</NoValue></Value>
                        </Field>
                        <Field>
                            <Key>Mesages FAR</Key>
                            <Value><NoValue>à venir</NoValue></Value>
                        </Field>
                        <Field>
                            <Key>Dernier message</Key>
                            <Value><NoValue>à venir</NoValue></Value>
                        </Field>
                    </BodyWithoutTopPadding>
                </Fields>
            </Zone>
            <Zone>
                <Fields>
                    <BodyWithTopPadding>
                        <Field>
                            <Key>Dernier contrôle</Key>
                            <Value>{props.vessel.lastControl ? props.vessel.lastControl : <NoValue>à venir</NoValue>}</Value>
                        </Field>

                    </BodyWithTopPadding>
                </Fields>
            </Zone>
        </Body>
    ) : <FingerprintSpinner color={COLORS.grayDarkerThree} className={'radar'} size={100}/>;
}

const NoVessel = styled(NoVesselSVG)`
  width: 60px;
  background: ${COLORS.grayBackground};
  padding: 92px 136px 92px 136px;
  margin: 10px 0 5px 0;
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

const ValueWithLineBreak = styled.div`
  color: ${COLORS.grayDarkerThree};
  padding: 2px 5px 5px 0;
  line-height: normal;
  font-size: 13px;
`

const PhotoZone = styled.div`
  margin: 5px 5px 10px 5px;
  background: ${COLORS.background};
`

const Body = styled.div`
  padding: 5px 5px 1px 5px;
`

const BodyWithTopPadding = styled.tbody`
  padding: 5px 5px 1px 5px;
`

const BodyWithoutTopPadding = styled.tbody`
  padding: 0 5px 1px 5px;
`

const TableBody = styled.tbody``

const Photo = styled.img`
  margin: 15px 0 10px 0;
  max-height: 190px;
  left: auto;
  right: auto;
`

const DummyPhoto = styled.img`
  margin: 15px 0 10px 0;
  max-height: 130px;
  left: auto;
  right: auto;
  opacity: 0.3;
`

const Zone = styled.div`
  margin: 5px 5px 10px 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
`

const ZoneWithoutBackground = styled.div`
  margin: 5px 5px 10px 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
`

const Fields = styled.table`
  padding: 10px 5px 5px 20px; 
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
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
  padding: 5px 5px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const TrimmedValue = styled.td`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;    
  max-width: 110px; 
`

const Value = styled.td`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const NoValue = styled.span`
  color: ${COLORS.grayDarkerTwo};
  font-weight: 300;
  line-height: normal;
`

const LatLon = styled.div`
  width: 133px;
  order: 1;
  background: ${COLORS.background};
  margin: 0;
  padding: 1px 10px 10px 10px;
  text-align: center;
`

const Course = styled.div`
  width: 133px;
  order: 2;
  background: ${COLORS.background};
  margin: 0 0 0 10px;
  padding: 1px 10px 10px 10px;
  text-align: center;
`

const Position = styled.div`
  width: 133px;
  order: 3;
  background: ${COLORS.background};
  margin: 0 0 0 10px;
  padding: 1px 10px 10px 10px;
  text-align: center;
`

export default VesselSummary
