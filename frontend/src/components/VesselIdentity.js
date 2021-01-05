import React, {useState} from "react";
import styled from "styled-components";
import {COLORS} from "../constants/constants";

const VesselIdentity = props => {
    const [photoFallback, setPhotoFallback] = useState(false)

    const showLicenceExpirationDate = licenceExpirationDate => {
        if (licenceExpirationDate) {
            const date = new Date(licenceExpirationDate)
            return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
        }
    }

    return (
        <>
        <Body>
            <PhotoZone>
                {
                    photoFallback ?
                        <DummyPhoto src={`boat_fishing.png`}/> :
                        <>
                        {
                            props.vessel.mmsi ? <Photo referrerpolicy="no-referrer" onError={() => setPhotoFallback(true)} src={`https://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=${props.vessel.mmsi}&size=thumb300`}/>
                            : null
                        }
                        </>
                }
            </PhotoZone>
            <Zone>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>CFR</Key>
                            <Value>{props.vessel.internalReferenceNumber ? props.vessel.internalReferenceNumber : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>IMO</Key>
                            <Value>{props.vessel.imo ? props.vessel.imo : <NoValue>-</NoValue>}</Value>
                        </Field>
                    </TableBody>
                </Fields>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>MMSI</Key>
                            <Value>{props.vessel.mmsi ? props.vessel.mmsi : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>CALL SIGN</Key>
                            <Value>{props.vessel.ircs ? props.vessel.ircs : <NoValue>-</NoValue>}</Value>
                        </Field>
                    </TableBody>
                </Fields>
            </Zone>
            <Zone>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>Nationalité</Key>
                            <TrimmedValue>{props.vessel.flagState ? props.vessel.flagState : <NoValue>-</NoValue>}</TrimmedValue>
                        </Field>
                        <Field>
                            <Key>Quartier</Key>
                            <TrimmedValue>{props.vessel.district ? <>{props.vessel.district} {props.vessel.districtCode ? <>({props.vessel.districtCode})</> : ''}</> : <NoValue>-</NoValue>}</TrimmedValue>
                        </Field>
                        <Field>
                            <Key>Port d'attache</Key>
                            <TrimmedValue>{props.vessel.registryPort ? props.vessel.registryPort : <NoValue>-</NoValue>}</TrimmedValue>
                        </Field>
                    </TableBody>
                </Fields>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>Taille</Key>
                            <Value>
                                {props.vessel.length ? props.vessel.length : <NoValue>-</NoValue>} x {props.vessel.width ? props.vessel.width : <NoValue>-</NoValue>}
                            </Value>
                        </Field>
                        <Field>
                            <Key>Jauge</Key>
                            <Value>{props.vessel.gauge ? <>{props.vessel.gauge} GT</> : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Moteur</Key>
                            <Value>{props.vessel.power ? <>{props.vessel.power} kW</> : <NoValue>-</NoValue>}</Value>
                        </Field>
                    </TableBody>
                </Fields>
            </Zone>
            <Zone>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>Genre de navigation</Key>
                            <Value>{props.vessel.vesselType ? props.vessel.vesselType : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Catégorie de navigation</Key>
                            <Value>{props.vessel.sailingCategory ? props.vessel.sailingCategory : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Type de flotte</Key>
                            <Value>{props.vessel.sailingType ? props.vessel.sailingType : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key/>
                        </Field>
                        <Field>
                            <Key>Engins de pêche utilisé <KeyInfo>JPE</KeyInfo></Key>
                            <Value><NoValue>-</NoValue></Value>
                        </Field>
                        <Field>
                            <Key>Engins de pêche déclarés <KeyInfo>PME</KeyInfo></Key>
                            <Value>
                                { props.vessel.declaredFishingGears ? <>
                                    {props.vessel.declaredFishingGears.join(", ")}
                                </> : <NoValue>-</NoValue>
                                }
                            </Value>
                        </Field>
                        <Field>
                            <Key/>
                        </Field>
                        <Field>
                            <Key>Poids autorisés en pontée</Key>
                            <Value>{ props.vessel.weightAuthorizedOnDeck ? <>{props.vessel.weightAuthorizedOnDeck} kg</> : <NoValue>-</NoValue> }</Value>
                        </Field>
                        <Field>
                            <Key>Appartenance à une liste</Key>
                            <Value><NoValue>-</NoValue></Value>
                        </Field>
                        <Field>
                            <Key>Présence de pinger</Key>
                            <Value>
                                {
                                    props.vessel.pinger != null ? <>
                                        <PingerInput type="button" className={props.vessel.pinger ? 'primary' : ''} value="OUI"/>
                                        <PingerInput type="button" className={!props.vessel.pinger ? 'primary' : ''} value="NON"/>
                                        </> : <NoValue>-</NoValue>
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
                            <Key>Permis de navigation</Key>
                            <Value>
                                {
                                    props.vessel.navigationLicenceExpirationDate ? <>
                                            Exp le {showLicenceExpirationDate(props.vessel.navigationLicenceExpirationDate)}
                                            { new Date(props.vessel.navigationLicenceExpirationDate) >= Date.now() ? <LicenceActive /> : <LicenceExpired />}
                                         </>
                                    : <NoValue>-</NoValue>
                                }

                            </Value>
                        </Field>
                        <Field>
                            <Key>Coordonnées pêcheur</Key>
                            <Value>
                                <PersonalData>
                                    { props.vessel.fisherName ? <>
                                        {props.vessel.fisherName}
                                        <span>{ props.vessel.fisherPhones ? <><br/>{props.vessel.fisherPhones.join(", ")}</> : '' }</span>
                                        { props.vessel.fisherEmails ? <><br/>{props.vessel.fisherEmails.join(", ")}</> : '' }
                                    </> : <NoPersonalData>-</NoPersonalData>
                                    }
                                </PersonalData>
                            </Value>
                        </Field>
                        <Field>
                            <Key>Coordonnées armateur</Key>
                            <Value>
                                <PersonalData>
                                    { props.vessel.shipownerName ? <>
                                        {props.vessel.shipownerName}
                                        <span>{ props.vessel.shipownerPhones ? <><br/>{props.vessel.shipownerPhones.join(", ")}</> : '' }</span>
                                        { props.vessel.shipownerEmails ? <><br/>{props.vessel.shipownerEmails.join(", ")}</> : '' }
                                    </> : <NoPersonalData>-</NoPersonalData>
                                    }
                                </PersonalData>
                            </Value>
                        </Field>
                    </TableBody>
                </Fields>
            </Zone>
        </Body>
        </>
    )
}

const PhotoZone = styled.div`
  margin: 5px 5px 10px 5px;
  background: ${COLORS.background};
`

const Body = styled.div`
  background: ${COLORS.grayBackground};
  padding: 5px 5px 1px 5px;
`

const LicenceActive = styled.span`
  height: 8px;
  margin-left: 5px;
  width: 8px;
  background-color: green;
  border-radius: 50%;
  display: inline-block;
`

const LicenceExpired = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: red;
  border-radius: 50%;
  display: inline-block;
`

const TableBody = styled.tbody``

const PingerInput = styled.input`
  font-size: 0.9em;
  padding: 0px 2px 0px 2px;
  margin: -5px 2px 0 2px;
`

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

// TODO Keep for the fishery tab
const ZoneTitle = styled.div`
  color: ${COLORS.textGray};
  background: ${COLORS.grayDarker};
  padding: 10px 10px 10px 20px;
  font-size: 0.8rem;
  flex-shrink: 0;
  flex-grow: 1;
  width: 400px;
  margin-bottom: 5px;
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

const KeyInfo = styled.span`
  font-size: 0.5rem;
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
  color: ${COLORS.textBueGray};
  font-weight: 300;
  line-height: normal;
`

const NoPersonalData = styled.div`
  color: ${COLORS.textBueGray};
  font-weight: 300;
`

const PersonalData = styled.div`
  line-height: inherit;
  font-size: 0.8rem !important;
  margin-top: -5px;
`

const PanelTitle = styled.span`
  padding: 5px 0 5px 0;
  display: inline-block;
  font-size: 16px;
  text-align: center;
  background: ${COLORS.grayDarkerThree};
  color: ${COLORS.grayBackground};
  width: 100%;
`

export default VesselIdentity
