import React, {useEffect, useState} from "react";
import styled from 'styled-components';
import { FingerprintSpinner } from 'react-epic-spinners'

import {getDateTime, getCoordinates, timeagoFrenchLocale} from "../utils";
import {WSG84_PROJECTION} from "../domain/entities/map";
import {ReactComponent as VesselIDSVG} from "../components/icons/picto_carte_identite_navire.svg";
import {ReactComponent as ControlsSVG} from "../components/icons/Picto_controles.svg";
import {ReactComponent as ObservationsSVG} from "../components/icons/Picto_observations_ciblage.svg";
import {ReactComponent as VMSSVG} from "../components/icons/Picto_VMS_ERS.svg";
import {ReactComponent as FisheriesSVG} from "../components/icons/Picto_activites_peche.svg";
import {ReactComponent as CloseIconSVG} from "../components/icons/Croix_grise.svg";
import {useDispatch, useSelector} from "react-redux";
import hideVesselSummary from "../domain/use_cases/hideVesselSummary";
import showVesselBox from "../domain/use_cases/showVesselBox";
import {COLORS} from "../constants/constants";
import * as timeago from 'timeago.js';
timeago.register('fr', timeagoFrenchLocale);

const VesselSummary = () => {
    const [photoFallback, setPhotoFallback] = useState(false)
    const selectedVessel = useSelector(state => state.vessel.selectedVessel)
    const vesselSummaryIsOpen = useSelector(state => state.vessel.vesselSummaryIsOpen)
    const [vessel, setVessel] = useState(null);
    const [lastPosition, setLastPosition] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch()

    useEffect(() => {
        if (!isOpen) {
            dispatch(hideVesselSummary())
        }
    }, [isOpen])

    useEffect(() => {
        if (selectedVessel) {
            setVessel(selectedVessel)
            setLastPosition(selectedVessel.positions[selectedVessel.positions.length - 1])
            setIsOpen(true)
            setIsLoading(false)

            if(selectedVessel.mmsi) {
                setPhotoFallback(false)
            } else {
                setPhotoFallback(true)
            }
        } else {
            setIsLoading(true)
        }
    }, [selectedVessel, vesselSummaryIsOpen])

    return isOpen && !isLoading ? (
        <>
            <VesselSummaryHeader>
                {
                    vessel.flagState ? <><Flag rel="preload" src={`flags/${vessel.flagState.toLowerCase()}.svg`} />{' '}</> : null
                }
                <VesselSummaryTitle>{vessel.vesselName ? vessel.vesselName : 'NOM INCONNU'} {vessel.flagState ? <>({vessel.flagState})</> : ''}</VesselSummaryTitle>
                <CloseIcon onClick={() => setIsOpen(false)}/>
            </VesselSummaryHeader>
            <VesselSummaryBody>
                <PhotoColumn>
                    <VerticalAlignHelper/>
                    {
                        photoFallback ?
                            <DummyPhoto src={`boat_fishing.png`}/> :
                            <>
                                {
                                    vessel.mmsi ? <Photo alt="Photo de MarineTraffic" referrerpolicy="no-referrer" onError={() => setPhotoFallback(true)} src={`https://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=${vessel.mmsi}&size=thumb300`}/>
                                        : null
                                }
                            </>
                    }
                </PhotoColumn>
                <PositionColumn>
                    <FieldName>Lat. / Lon.</FieldName>
                    <FieldValue>{getCoordinates([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION)[0]}</FieldValue>
                    <FieldValue>{getCoordinates([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION)[1]}</FieldValue>
                    <FieldNameWithTopMargin>Route / Vitesse</FieldNameWithTopMargin>
                    <FieldValue>{lastPosition.course ? <>{lastPosition.course}°</> : <NoValue>-</NoValue>}</FieldValue>
                    <FieldValue>{lastPosition.speed ? <>{lastPosition.speed} Nds</> : <NoValue>-</NoValue>}</FieldValue>
                </PositionColumn>
            </VesselSummaryBody>
            <Zone>
                <Fields>
                    <Body>
                        <Field>
                            <Key>Dernier signal</Key>
                            <Value>
                                {
                                lastPosition.dateTime ? <>
                                        {getDateTime(lastPosition.dateTime)}{' '}
                                        <Gray>(CET)</Gray></>
                                    : <NoValue>-</NoValue>
                                }
                            </Value>
                        </Field>
                    </Body>
                </Fields>
            </Zone>
            <VesselSummaryBottom>
                <ColumnOne>
                    <Fields>
                        <Body>
                            <Field>
                                <Key>CFR</Key>
                                <Value>{vessel.internalReferenceNumber ? vessel.internalReferenceNumber : <NoValue>-</NoValue>}</Value>
                            </Field>
                            <Field>
                                <Key>MMSI</Key>
                                <Value>{vessel.MMSI ? vessel.MMSI : <NoValue>-</NoValue>}</Value>
                            </Field>
                        </Body>
                    </Fields>
                </ColumnOne>
                <ColumnTwo>
                    <Fields>
                        <Body>
                            <Field>
                                <Key>Marquage extérieur</Key>
                                <Value>{vessel.externalReferenceNumber ? vessel.externalReferenceNumber : <NoValue>-</NoValue>}</Value>
                            </Field>
                            <Field>
                                <Key>Call Sign (IRCS)</Key>
                                <Value>{vessel.IRCS ? vessel.IRCS : <NoValue>-</NoValue>}</Value>
                            </Field>
                        </Body>
                    </Fields>
                </ColumnTwo>
            </VesselSummaryBottom>
            <Zone>
                <Fields>
                    <Body>
                        <Field>
                            <Key>Seg. flotte</Key>
                            <Value>{vessel.fleetSegment ? vessel.fleetSegment : <NoValue>à venir</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Engins à bord (JPE)</Key>
                            <Value><NoValue>à venir</NoValue></Value>
                        </Field>
                    </Body>
                </Fields>
            </Zone>
            <Zone>
                <Fields>
                    <Body>
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
                    </Body>
                </Fields>
            </Zone>
            <Zone>
                <Fields>
                    <Body>
                        <Field>
                            <Key>Dernier contrôle</Key>
                            <Value>{vessel.lastControl ? vessel.lastControl : <NoValue>à venir</NoValue>}</Value>
                        </Field>

                    </Body>
                </Fields>
            </Zone>
            <TabList>
                <Tab onClick={() => dispatch(showVesselBox(1))}>
                    <VesselIDIcon />
                </Tab>
                <Tab>
                    <FisheriesIcon />
                </Tab>
                <Tab>
                    <ControlsIcon />
                </Tab>
                <Tab>
                    <ObservationsIcon />
                </Tab>
                <TabWithoutBorder>
                    <VMSIcon />
                </TabWithoutBorder>
            </TabList>

            <TrianglePointer>
                <TriangleShadow />
            </TrianglePointer>
        </>
    ) : <FingerprintSpinner color={COLORS.grayDarkerThree} className={'radar'} size={100}/>;
}

const Flag = styled.img`
    font-size: 1.5em;
    margin-left: 5px;
    display: inline-block;
    width: 1em;                      
    height: 1em;                      
    vertical-align: middle;
`

const VerticalAlignHelper = styled.span`
  display: inline-block;
  height: 100%;
  vertical-align: middle;
`

const Body = styled.tbody``

const Tab = styled.button`
  display: inline-block;
  width: 100px;
  margin: 0;
  border: none;
  border-radius: 0;
  height: 44px;
  background: ${COLORS.grayDarkerThree};
  border-right: 1px solid ${COLORS.grayDarkerTwo}
`

const TabWithoutBorder = styled.button`
  display: inline-block;
  width: 100px;
  margin: 0;
  border: none;
  border-radius: 0;
  height: 44px;
  background: ${COLORS.grayDarkerThree};
`

const TabList = styled.div`
  display: flex;
  margin-top: 5px;
  background: ${COLORS.grayDarkerTwo};
`

const VesselIDIcon = styled(VesselIDSVG)`
  width: 30px;
`

const ControlsIcon = styled(ControlsSVG)`
  width: 23px;
`

const ObservationsIcon = styled(ObservationsSVG)`
  width: 35px;
`

const VMSIcon = styled(VMSSVG)`
  width: 20px;
`

const FisheriesIcon = styled(FisheriesSVG)`
  width: 30px;
`

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
  border-width: 11px 6px 0 6px;
  border-color: ${COLORS.grayDarkerThree} transparent transparent transparent;
  margin-left: 179px;
  margin-top: -1px;
  clear: top;
`

const NoValue = styled.span`
  color: ${COLORS.textGray};
  font-weight: 300;
`

const ColumnOne = styled.div`
  order: 1;
  padding: 5px 0 0 0;
`

const ColumnTwo = styled.div`
  order: 2;
  padding: 5px 0 0 0;
`

const VesselSummaryBottom = styled.div`
  display: flex;
  background: ${COLORS.background};
  margin: 5px 5px 0 5px;
`

const Gray = styled.span`
  color: ${COLORS.textGray};
  font-weight: 300;
`

const FieldName = styled.div`
  margin-top: 2px;
  margin-bottom: 2px;
  color: ${COLORS.textGray};
  font-size: 13px;
  font-weight: normal;
`

const FieldNameWithTopMargin = styled.div`
  margin-top: 10px;
  margin-bottom: 2px;
  color: ${COLORS.textGray};
  font-size: 13px;
  font-weight: normal;
`

const FieldValue = styled.div`
  line-height: 1.2em;
  font-size: 13px;
  font-weight: medium;
  color: ${COLORS.grayDarkerThree};
`

const Photo = styled.img`
  left: auto;
  right: auto;
  position: absolute;
  bottom: 0;
  left: 0;
`

const DummyPhoto = styled.img`
  max-height: 140px;
  left: auto;
  right: auto;
  vertical-align: middle;
  opacity: 0.5;
`

const PhotoColumn = styled.div`
  width: 220px;
  position: relative;
  order: 1;
  overflow: hidden;
`

const PositionColumn = styled.div`
  height: 125px;
  width: 129px;
  order: 2;
  padding: 10px 5px 5px 5px;
  color: ${COLORS.textGray};
  background: ${COLORS.background};
  margin-left: 5px;
`

const Zone = styled.div`
  margin: 5px 5px 0 5px;
  background: ${COLORS.background};
  padding: 5px 5px 0 0;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
`

const Fields = styled.table`
  width: inherit;
  display: table;
  margin: 0;
  padding: 4px 5px 4px 10px;
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
  font-size: 13px;
  font-weight: normal;
  margin: 0;
  border: none;
  padding: 0 5px 0 0;
  background: none;
  width: max-content;
  line-height: normal;
  height: 20px;
`

const Value = styled.td`
  color: ${COLORS.grayDarkerThree};
  font-size: 13px;
  font-weight: medium;
  margin: 0;
  text-align: left;
  padding: 0 0 0 5px;
  background: none;
  border: none;
  line-height: normal;
  height: 20px;
`

const VesselSummaryHeader = styled.div`
  background: ${COLORS.grayDarkerThree};
  padding: 5px 5px 5px 5px;
  color: ${COLORS.grayBackground};
`

const VesselSummaryTitle = styled.span`
  margin-left: 5px;
  display: inline-block;
  vertical-align: middle;
`

const VesselSummaryBody = styled.div`
  margin: 5px 5px 5px 5px;
  display: flex;
  text-align: center;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 15px;
  float: right;
  margin-right: 5px;
  height: 1.5em;
  margin-top: 1px;
  cursor: pointer;
`

export default VesselSummary
