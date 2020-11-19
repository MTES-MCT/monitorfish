import React, {useEffect, useState} from "react";
import styled from "styled-components";

const VesselIdentity = props => {
    const [fallback, setFallback] = useState(false)

    const showLicenceExpirationDate = licenceExpirationDate => {
        if (licenceExpirationDate) {
            const date = new Date(licenceExpirationDate)
            return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`
        }
    }

    return (
        <div>
            <PanelTitle>Carte d'identité du navire</PanelTitle>
            {
                fallback ?
                    <DummyPhoto src={`boat_fishing.png`}/> :
                    <>
                    {
                        props.vessel.mmsi ? <Photo referrerpolicy="no-referrer" onError={() => setFallback(true)} src={`https://photos.marinetraffic.com/ais/showphoto.aspx?mmsi=${props.vessel.mmsi}&size=thumb300`}/>
                        : null
                    }
                    </>
            }
            <Zone>
                <ZoneTitle>Numéros d'identification</ZoneTitle>
                <Fields>
                    <Body>
                        <Field>
                            <Key>CFR</Key>
                            <Value>{props.vessel.internalReferenceNumber ? props.vessel.internalReferenceNumber : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>IMO</Key>
                            <Value>{props.vessel.externalReferenceNumber ? props.vessel.externalReferenceNumber : <NoValue>-</NoValue>}</Value>
                        </Field>
                    </Body>
                </Fields>
                <Fields>
                    <Body>
                        <Field>
                            <Key>MMSI</Key>
                            <Value>{props.vessel.mmsi ? props.vessel.mmsi : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>CALL SIGN</Key>
                            <Value>{props.vessel.ircs ? props.vessel.ircs : <NoValue>-</NoValue>}</Value>
                        </Field>
                    </Body>
                </Fields>
            </Zone>
            <Zone>
                <ZoneTitle>Informations navire</ZoneTitle>
                <Fields>
                    <Body>
                        <Field>
                            <Key>Nationalité</Key>
                            <Value>{props.vessel.flagState ? props.vessel.flagState : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Quartier</Key>
                            <Value>{props.vessel.district ? <>{props.vessel.district} {props.vessel.districtCode ? <>({props.vessel.districtCode})</> : ''}</> : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Port d'attache</Key>
                            <Value>{props.vessel.registryPort ? props.vessel.registryPort : <NoValue>-</NoValue>}</Value>
                        </Field>
                    </Body>
                </Fields>
                <Fields>
                    <Body>
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
                    </Body>
                </Fields>
            </Zone>
            <Zone>
                <ZoneTitle>Informations activités</ZoneTitle>
                <Fields>
                    <Body>
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
                                { props.vessel.declaredFishingGearMain ? <>
                                    {props.vessel.declaredFishingGearMain}
                                    {props.vessel.declaredFishingGearSecondary ? ', ' + props.vessel.declaredFishingGearSecondary : null}
                                    {props.vessel.declaredFishingGearThird ? ', ' + props.vessel.declaredFishingGearThird : null}
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
                    </Body>
                </Fields>
            </Zone>
            <Zone>
                <ZoneTitle>Informations équipage</ZoneTitle>
                <Fields>
                    <Body>
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
                                    { props.vessel.fisherName ? <>{props.vessel.fisherName}<br/>{props.vessel.fisherTelephoneNumber}<br/>{props.vessel.fisherEmail}</> : <NoPersonalData>-</NoPersonalData> }
                                </PersonalData>
                            </Value>
                        </Field>
                        <Field>
                            <Key>Coordonnées armateur</Key>
                            <Value>
                                <PersonalData>
                                    { props.vessel.shipownerName ? <>
                                        {props.vessel.shipownerName}
                                        <span>{ props.vessel.shipownerTelephoneNumber ? <><br/>{props.vessel.shipownerTelephoneNumber}</> : '' }</span>
                                        { props.vessel.shipownerEmail ? <><br/>{props.vessel.shipownerEmail}</> : '' }
                                    </> : <NoPersonalData>-</NoPersonalData>
                                    }
                                </PersonalData>
                            </Value>
                        </Field>
                    </Body>
                </Fields>
            </Zone>
        </div>
    )
}

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

const Body = styled.tbody``

const PingerInput = styled.input`
  font-size: 0.9em;
  padding: 0px 2px 0px 2px;
  margin: -5px 2px 0 2px;
`

const Photo = styled.img`
  margin: 10px 0 5px 0;
  max-height: 190px;
  left: auto;
  right: auto;
`

const DummyPhoto = styled.img`
  margin: 10px 0 5px 0;
  max-height: 130px;
  left: auto;
  right: auto;
`

const Zone = styled.div`
  margin: 0;
  padding: 15px 5px 0 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
`

const ZoneTitle = styled.div`
  color: grey;
  font-size: 0.8rem;
  text-transform: uppercase;
  flex-shrink: 0;
  flex-grow: 1;
  width: 100%;
  margin-bottom: 5px;
  font-weight: 600;
`

const Fields = styled.table`
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
  color: grey;
  flex: initial;
  display: inline-block;
  font-size: 0.8rem;
  text-transform: uppercase;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  font-weight: 300;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
`

const KeyInfo = styled.span`
  font-size: 0.5rem;
`


const Value = styled.td`
  font-size: 0.8rem;
  color: rgba(5, 5, 94, 1);
  font-weight: bold;
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  vertical-align: top;
`

const NoValue = styled.span`
  color: grey;
  font-weight: 300;
  line-height: normal;
  vertical-align: top;
`

const NoPersonalData = styled.div`
  color: grey;
  font-weight: 300;
`

const PersonalData = styled.div`
  line-height: inherit;
  font-size: 0.8rem !important;
  margin-top: -5px;
`

const PanelTitle = styled.span`
  display: inline-block;
  font-size: 1rem;
  margin: 5px 0 0 5px;
  text-align: left;
  font-weight: bolder;
  color: rgba(5, 5, 94, 1);
  width: 100%;
`

export default VesselIdentity
