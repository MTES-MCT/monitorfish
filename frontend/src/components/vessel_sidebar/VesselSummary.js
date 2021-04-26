import React, {useEffect, useState} from "react";
import styled from 'styled-components';
import {ReactComponent as NoVesselSVG} from '../icons/Picto_photo_navire_manquante.svg';

import {getCoordinates, getDateTime, timeagoFrenchLocale} from "../../utils";
import {WSG84_PROJECTION} from "../../domain/entities/map";
import {COLORS} from "../../constants/constants";
import * as timeago from 'timeago.js';
import {ReactComponent as InfoSVG} from '../icons/Information.svg';


import { vesselsAreEquals } from '../../domain/entities/vessel'
timeago.register('fr', timeagoFrenchLocale);

const VesselSummary = props => {
    const [photoFallback, setPhotoFallback] = useState(false)
    const [vessel, setVessel] = useState(null);
    const [lastPosition, setLastPosition] = useState(null);
    const [gears, setGears] = useState([])
    const [faoZones, setFaoZones] = useState([])
    const [fleetSegments, setFleetSegments] = useState([])

    useEffect(() => {
        if (props.vessel) {
            if(props.vessel.positions.length) {
                setLastPosition(props.vessel.positions[props.vessel.positions.length - 1])
            } else {
                if(!vesselsAreEquals(props.vessel, vessel)) {
                    setLastPosition(null)
                }
            }

            if(props.vessel.mmsi) {
                setPhotoFallback(false)
            } else {
                setPhotoFallback(true)
            }

            if(props.vesselLastPositionFeature && props.vesselLastPositionFeature.getProperties().speciesOnboard) {
                const faoZones = props.vesselLastPositionFeature.getProperties().speciesOnboard.map(species => {
                    return species.faoZone
                })

                setFaoZones([...new Set(faoZones)])
            } else {
                setFaoZones([])
            }

            setVessel(props.vessel)
        }
    }, [props.vessel, props.error])

    useEffect(() => {
        if(props.gears && props.vesselLastPositionFeature && props.vesselLastPositionFeature.getProperties().gearOnboard) {
            const gears = props.vesselLastPositionFeature.getProperties().gearOnboard.map(gearERS => {
                let foundGear = props.gears.find(gear => gear.code === gearERS.gear)
                return {
                    name: foundGear ? foundGear.name : null,
                    code: gearERS.gear
                }
            })

            setGears(gears)
        } else {
            setGears([])
        }
    }, [props.gears, props.vessel])

    useEffect(() => {
        if(props.vesselLastPositionFeature && props.vesselLastPositionFeature.getProperties().segments &&
          props.vesselLastPositionFeature.getProperties().segments.length) {
            if(props.fleetSegments && props.fleetSegments.length) {
                let nextFleetSegments = props.vesselLastPositionFeature.getProperties().segments.map(segment => {
                    let found = props.fleetSegments.find(segmentWithProperties => segmentWithProperties.segment === segment)

                    if(found) {
                        return found
                    } else {
                        return {
                            segment: segment
                        }
                    }
                }).filter(segment => segment)
                setFleetSegments(nextFleetSegments)
            } else {
                let nextFleetSegments = props.vesselLastPositionFeature.getProperties().segments.map(segment => {
                    return {
                        segment: segment
                    }
                })
                setFleetSegments(nextFleetSegments)
            }
        } else {
            setFleetSegments([])
        }
    }, [props.fleetSegments, props.vesselLastPositionFeature])

    function getSegmentInfo (segment) {
        if(segment.gears || segment.faoAreas || segment.targetSpecies || segment.dirm || segment.bycatchSpecies) {
            let gears = segment.gears && segment.gears.length ? segment.gears.join(', ') : 'aucun'
            let faoAreas = segment.faoAreas && segment.faoAreas.length ? segment.faoAreas.join(', ') : 'aucune'
            let dirm = segment.dirm && segment.dirm.length ? segment.dirm.join(', ') : 'aucune'

            let targetSpeciesArray = []
            if(segment.targetSpecies && segment.targetSpecies.length) {
                targetSpeciesArray = targetSpeciesArray.concat(segment.targetSpecies)
            }
            if(segment.bycatchSpecies && segment.bycatchSpecies.length) {
                targetSpeciesArray = targetSpeciesArray.concat(segment.bycatchSpecies)
            }
            let targetSpecies = targetSpeciesArray && targetSpeciesArray.length ? targetSpeciesArray.join(', ') : 'aucune'

            return `Engins: ${gears}
Zones FAO: ${faoAreas}
Espèces: ${targetSpecies}
Façade: ${dirm}`
        } else {
            return 'Segment de flotte inconnu'
        }
    }

    function getVesselOrLastPositionProperty (propertyName) {
        if(vessel && vessel[propertyName]) {
            return vessel[propertyName]
        } else if (lastPosition && lastPosition[propertyName]) {
            return lastPosition[propertyName]
        } else {
            return <NoValue>-</NoValue>
        }
    }

    function getGears () {
        if(gears && gears.length) {
            const uniqueGears = gears.reduce((acc, current) => {
                const found = acc.find(item =>
                  item.code === current.code &&
                  item.name === current.name);
                if (!found) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
            }, [])

            return uniqueGears.map(gear => {
                  return gear.name ?
                    <ValueWithLineBreak key={gear.code}>{gear.name} ({gear.code})</ValueWithLineBreak>
                    : <ValueWithLineBreak key={gear.code}>{gear.code}</ValueWithLineBreak>

              })
        }

        return <NoValue>-</NoValue>
    }

    return vessel ? (
        <Body>
            <PhotoZone>
                {
                    photoFallback ?
                        <NoVessel /> :
                        <>
                            {
                                vessel.mmsi ? <Photo referrerpolicy="no-referrer" onError={() => setPhotoFallback(true)} src={`https://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=${props.vessel.mmsi}&size=thumb300`}/>
                                    : null
                            }
                        </>
                }
            </PhotoZone>
            <ZoneWithoutBackground>
                <LatLon>
                    <FieldName>Latitude</FieldName>
                    <FieldValue>{lastPosition && !isNaN(lastPosition.latitude) && !isNaN(lastPosition.longitude) ? getCoordinates([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION)[0] : <NoValue>-</NoValue>}</FieldValue>
                    <FieldName>Longitude</FieldName>
                    <FieldValue>{lastPosition && !isNaN(lastPosition.latitude) && !isNaN(lastPosition.longitude) ? getCoordinates([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION)[1] : <NoValue>-</NoValue>}</FieldValue>
                </LatLon>
                <Course>
                    <FieldName>Route</FieldName>
                    <FieldValue>{lastPosition && !isNaN(lastPosition.course) ? <>{lastPosition.course}°</> : <NoValue>-</NoValue>}</FieldValue>
                    <FieldName>Vitesse</FieldName>
                    <FieldValue>{lastPosition && !isNaN(lastPosition.speed)? <>{lastPosition.speed} Nds</> : <NoValue>-</NoValue>}</FieldValue>
                </Course>
                <Position>
                    <FieldName>Dernier signal VMS</FieldName>
                    <FieldValue>
                        {
                            lastPosition && lastPosition.dateTime ? <>
                                    {getDateTime(lastPosition.dateTime, true)}{' '}
                                    <Gray>(UTC)</Gray></>
                                : <NoValue>-</NoValue>
                        }
                    </FieldValue>
                    <FieldName>Dernier cadencement <Info title={"Cette valeur est calculée à partir des 2 dernières positions VMS reçues"}/></FieldName>
                    <FieldValue>
                        {
                            props.vesselLastPositionFeature && props.vesselLastPositionFeature.getProperties().emissionPeriod
                              ? <>1 signal toutes les {props.vesselLastPositionFeature.getProperties().emissionPeriod / 60} minutes</>
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
                            <Value>
                                {
                                    getVesselOrLastPositionProperty('internalReferenceNumber')
                                }
                            </Value>
                        </Field>
                        <Field>
                            <Key>MMSI</Key>
                            <Value>
                                {
                                    getVesselOrLastPositionProperty('mmsi')
                                }
                            </Value>
                        </Field>
                    </TableBody>
                </Fields>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>Marquage ext.</Key>
                            <Value>
                                {
                                    getVesselOrLastPositionProperty('externalReferenceNumber')
                                }
                            </Value>
                        </Field>
                        <Field>
                            <Key>Call Sign (IRCS)</Key>
                            <Value>
                                {
                                    getVesselOrLastPositionProperty('ircs')
                                }
                            </Value>
                        </Field>
                    </TableBody>
                </Fields>
            </Zone>
            <Zone>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>Segments de flotte</Key>
                            <Value>
                                {
                                    fleetSegments && fleetSegments.length
                                      ? fleetSegments.map((segment, index) => {
                                          return <>
                                              {segment.segment}
                                              <Info isInfoSegment={true} title={getSegmentInfo(segment)}/>
                                              {fleetSegments.length === index + 1 ? '' : ', '}
                                              </>
                                      })
                                      : <NoValue>-</NoValue>
                                }
                            </Value>
                        </Field>
                        <Field>
                            <Key>Engins à bord (JPE)</Key>
                            <Value>
                                {
                                    getGears()
                                }
                            </Value>
                        </Field>
                        <Field>
                            <Key>Zones de la marée (FAR)</Key>
                            <Value>
                                {
                                    faoZones && faoZones.length
                                      ? faoZones.join(", ")
                                      : <NoValue>Aucune zone de pêche reçue</NoValue>
                                }
                            </Value>
                        </Field>
                    </TableBody>
                </Fields>
            </Zone>
            <Zone>
                <Fields>
                    <BodyWithTopPadding>
                        <Field>
                            <Key>Dernier contrôle</Key>
                            <Value>{vessel.lastControl ? vessel.lastControl : <NoValue>à venir</NoValue>}</Value>
                        </Field>

                    </BodyWithTopPadding>
                </Fields>
            </Zone>
        </Body>
    ) : null
}

const Gray = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-weight: 300;
`

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

const TableBody = styled.tbody``

const Photo = styled.img`
  margin: 15px 0 10px 0;
  max-height: 190px;
  left: auto;
  right: auto;
`

const Zone = styled.div`
  margin: 5px 5px 10px 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
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

const ZoneWithoutBackground = styled.div`
  margin: 5px 5px 10px 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 1;
`

const LatLon = styled.div`
  order: 1;
  background: ${COLORS.background};
  margin: 0;
  padding: 1px 10px 10px 10px;
  text-align: center;
  flex-grow: 1;
`

const Course = styled.div`
  order: 2;
  background: ${COLORS.background};
  margin: 0 0 0 10px;
  padding: 1px 10px 10px 10px;
  text-align: center;
  flex-grow: 1;
`

const Position = styled.div`
  order: 3;
  background: ${COLORS.background};
  margin: 0 0 0 10px;
  padding: 1px 10px 10px 10px;
  text-align: center;
  flex-grow: 1;
`

const Info = styled(InfoSVG)`
  width: 14px;
  vertical-align: text-bottom;
  margin-bottom: 2px;
  margin-left: ${props => props.isInfoSegment ? '5px' : '2px'};
`

export default VesselSummary
