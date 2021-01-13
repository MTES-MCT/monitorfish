import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../constants/constants";
import countries from "i18n-iso-countries";
countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));

const VesselIdentity = props => {
    const [gears, setGears] = useState([])

    const showLicenceExpirationDate = licenceExpirationDate => {
        if (licenceExpirationDate) {
            const date = new Date(licenceExpirationDate)
            return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
        }
    }

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

    return (
        <Body>
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
                            <Key>Nationalité</Key>
                            <TrimmedValue>{props.vessel.flagState ? countries.getName(props.vessel.flagState, "fr") : <NoValue>-</NoValue>}</TrimmedValue>
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
                            <Key>Type de navire</Key>
                            <Value>{props.vessel.vesselType ? props.vessel.vesselType : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Catégorie de navigation</Key>
                            <Value>{props.vessel.sailingCategory ? props.vessel.sailingCategory : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Genre de navigation</Key>
                            <Value>{props.vessel.sailingType ? props.vessel.sailingType : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key/>
                        </Field>
                        <Field>
                            <Key>Engins de pêche utilisés (JPE)</Key>
                            <Value><NoValue>-</NoValue></Value>
                        </Field>
                        <Field>
                            <Key>Engins de pêche déclarés (PME)</Key>
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
    )
}

const ValueWithLineBreak = styled.div`
  color: ${COLORS.grayDarkerThree};
  padding: 2px 5px 5px 0;
  line-height: normal;
  font-size: 13px;
`

const Body = styled.div`
  padding: 5px 5px 1px 5px;
`

const LicenceActive = styled.span`
  height: 8px;
  margin-left: 5px;
  width: 8px;
  background-color: #8CC61F;
  border-radius: 50%;
  display: inline-block;
`

const LicenceExpired = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: #E1000F;
  border-radius: 50%;
  display: inline-block;
`

const TableBody = styled.tbody``

const PingerInput = styled.input`
  font-size: 0.9em;
  padding: 0px 2px 0px 2px;
  margin: -5px 2px 0 2px;
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
  max-width: 120px; 
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

export default VesselIdentity
