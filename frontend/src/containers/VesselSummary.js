import React, {useEffect, useState} from "react";
import styled from 'styled-components';
import { FingerprintSpinner } from 'react-epic-spinners'
import ReactCountryFlag from "react-country-flag";

import {getDateTime, getCoordinates} from "../utils";
import {WSG84_PROJECTION} from "../domain/map";
import {ReactComponent as VesselIDSVG} from "../components/icons/picto_carte_identite_navire.svg";
import {ReactComponent as ControlsSVG} from "../components/icons/Picto_controles.svg";
import {ReactComponent as ObservationsSVG} from "../components/icons/Picto_observations_ciblage.svg";
import {ReactComponent as VMSSVG} from "../components/icons/Picto_VMS_ERS.svg";
import {ReactComponent as FisheriesSVG} from "../components/icons/Picto_activites_peche.svg";
import {useDispatch, useSelector} from "react-redux";
import hideVesselSummary from "../use_cases/hideVesselSummary";
import showVesselBox from "../use_cases/showVesselBox";
import {COLORS} from "../constants/constants";

const VesselSummary = () => {
    const [photoFallback, setPhotoFallback] = useState(false)
    const selectedVessel = useSelector(state => state.vessel.selectedVessel)
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
    }, [selectedVessel])

    return isOpen && !isLoading ? (
        <>
            <VesselSummaryHeader>
                {
                    vessel.flagState ? <><ReactCountryFlag countryCode={vessel.flagState} style={{fontSize: '1.5em', marginLeft: '5px'}}/>{' '}</> : null
                }
                <VesselSummaryTitle>{vessel.vesselName ? vessel.vesselName : 'NOM INCONNU'} {vessel.flagState ? <>({vessel.flagState})</> : ''}</VesselSummaryTitle>
                <Close src={'close.png'} onClick={() => setIsOpen(false)}/>
            </VesselSummaryHeader>
            <VesselSummaryBody>
                <PhotoColumn>
                    <VerticalAlignHelper/>
                    {
                        photoFallback ?
                            <DummyPhoto src={`boat_fishing.png`}/> :
                            <>
                                {
                                    vessel.mmsi ? <Photo referrerpolicy="no-referrer" onError={() => setPhotoFallback(true)} src={`https://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=${vessel.mmsi}&size=thumb300`}/>
                                        : null
                                }
                            </>
                    }
                </PhotoColumn>
                <PositionColumn>
                    <FieldName>LAT / LON</FieldName>
                    <FieldValue>{getCoordinates([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION)[0]}</FieldValue>
                    <FieldValue>{getCoordinates([lastPosition.longitude, lastPosition.latitude], WSG84_PROJECTION)[1]}</FieldValue>
                    <FieldNameWithTopMargin>ROUTE / VITESSE</FieldNameWithTopMargin>
                    <FieldValue>{lastPosition.course ? <>{lastPosition.course}°</> : <NoValue>-</NoValue>} <Gray>/</Gray> {lastPosition.speed ? <>{lastPosition.speed} Nds</> : <NoValue>-</NoValue>}</FieldValue>
                </PositionColumn>
            </VesselSummaryBody>
            <Zone>
                <Fields>
                    <Body>
                        <Field>
                            <Key>DERNIER SIGNAL</Key>
                            <Value>
                                {
                                lastPosition.dateTime ? <>
                                        {getDateTime(lastPosition.dateTime)}{' '}
                                        <Gray>CET</Gray></>
                                    : <NoValue>-</NoValue>
                            }
                            </Value>
                        </Field>
                    </Body>
                </Fields>
            </Zone>
            <VesselSummaryBottom>
                <ColumnOne>
                    <Row>
                        <BottomFieldName>CFR</BottomFieldName>
                        <BottomFieldValue>{vessel.internalReferenceNumber ? vessel.internalReferenceNumber : <NoValue>-</NoValue>}</BottomFieldValue>
                    </Row>
                    <Row>
                        <BottomFieldName>XR</BottomFieldName>
                        <BottomFieldValue>{vessel.externalReferenceNumber ? vessel.externalReferenceNumber : <NoValue>-</NoValue>}</BottomFieldValue>
                    </Row>
                </ColumnOne>
                <ColumnTwo>
                    <Row>
                        <BottomFieldName>MMSI</BottomFieldName>
                        <BottomFieldValue>{vessel.MMSI ? vessel.MMSI : <NoValue>-</NoValue>}</BottomFieldValue>
                    </Row>
                    <Row>
                        <BottomFieldName>CALL SIGN</BottomFieldName>
                        <BottomFieldValue>{vessel.IRCS ? vessel.IRCS : <NoValue>-</NoValue>}</BottomFieldValue>
                    </Row>
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
                            <Key>Engins à bord <KeyInfo>JPE</KeyInfo></Key>
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
                <Tab>
                    <VMSIcon />
                </Tab>
            </TabList>

            <TrianglePointer>
                <TriangleShadow />
                <Triangle />
            </TrianglePointer>
        </>
    ) : <FingerprintSpinner color={COLORS.background} className={'radar'} size={100}/>;
}

const VerticalAlignHelper = styled.span`
  display: inline-block;
  height: 100%;
  vertical-align: middle;
`

const Body = styled.tbody``

const Close = styled.img`
  width: 12px;
  float: right;
  margin-top: 3px;
  padding: 5px 5px 5px 5px;
  cursor: pointer;
`

const Tab = styled.button`
  display: inline-block;
  width: 100px;
  margin: 0;
  border: none;
  border-radius: 0;
  height: 44px;
`

const TabList = styled.div`
  display: flex;
  border-top: 1px rgba(5, 5, 94, 0.2) solid
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
  border-color: #e6e6e6 transparent transparent transparent;
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

const VesselSummaryBottom = styled.div`
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

const FieldNameWithTopMargin = styled.div`
  margin-top: 10px;
  color: ${COLORS.textGray};
  font-size: 0.8em;
`

const FieldValue = styled.div`
  font-size: 0.8em;
  font-weight: 500;
`

const Photo = styled.img`
  max-height: 190px;
  left: auto;
  right: auto;
  vertical-align: middle;
`

const DummyPhoto = styled.img`
  max-height: 130px;
  left: auto;
  right: auto;
`

const PhotoColumn = styled.div`
  width: 220px;
  order: 1;
  border-right: 1px rgba(5, 5, 94, 0.1) solid;
  height: 137px;
  overflow-y: hidden;
`

const PositionColumn = styled.div`
  width: 129px;
  order: 2;
  padding: 5px 5px 5px 5px;
`


const Zone = styled.div`
  border-top: 1px rgba(5, 5, 94, 0.1) solid;
  margin: 0;
  padding: 5px 5px 0 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
`

const Fields = styled.table`
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  padding-bottom: 0;
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
  font-size: 0.8em;
  font-weight: 400;
  text-transform: uppercase;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
`

const KeyInfo = styled.span`
  font-size: 0.5rem;
`

const Value = styled.td`
  font-size: 0.8em;
  font-weight: 500;
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const VesselSummaryHeader = styled.div`
  background: rgba(5, 5, 94, 0.1);
  padding: 5px 5px 5px 5px;
  border-bottom: 1px rgba(5, 5, 94, 0.1) solid;
`

const VesselSummaryTitle = styled.span`
  margin-left: 5px;
  display: inline-block;
  vertical-align: middle;
`

const VesselSummaryBody = styled.div`
  display: flex;
  text-align: center;
`

export default VesselSummary
