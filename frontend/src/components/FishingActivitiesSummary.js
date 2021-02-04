import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../constants/constants";
import {ERSMessageType as ERSMessageTypeEnum} from "../domain/entities/ERS";
import {ReactComponent as ArrowSVG} from './icons/Picto_fleche-pleine-droite.svg'
import DEPMessageResume from "./ers_messages_resumes/DEPMessageResume";
import DISMessageResume from "./ers_messages_resumes/DISMessageResume";
import FARMessageResume from "./ers_messages_resumes/FARMessageResume";
import PNOMessageResume from "./ers_messages_resumes/PNOMessageResume";
import LANMessageResume from "./ers_messages_resumes/LANMessageResume";

const FishingActivitiesSummary = props => {
    const [depMessage, setDEPMessage] = useState(null)
    const [lanMessage, setLANMessage] = useState(null)
    const [pnoMessage, setPNOMessage] = useState(null)
    const [farMessages, setFARMessages] = useState(null)
    const [disMessages, setDISMessages] = useState(null)

    const [totalFARWeight, setTotalFARWeight] = useState(null)
    const [totalDEPWeight, setTotalDEPWeight] = useState(null)
    const [totalDISWeight, setTotalDISWeight] = useState(null)
    const [totalLANWeight, setTotalLANWeight] = useState(null)
    const [totalPNOWeight, setTotalPNOWeight] = useState(null)
    const [totalFARAndDEPWeight, setTotalFARAndDEPWeight] = useState(null)

    const [speciesToWeightOfFAR, setSpeciesToWeightOfFAR] = useState({})
    const [speciesToWeightOfPNO, setSpeciesToWeightOfPNO] = useState({})
    const [speciesToWeightOfDIS, setSpeciesToWeightOfDIS] = useState({})
    const [speciesToWeightOfLAN, setSpeciesToWeightOfLAN] = useState({})

    const [faoZones, setFAOZones] = useState([])

    useEffect(() => {
        if(props.fishingActivities && props.fishingActivities.length) {
            let depMessage = props.fishingActivities
                .find(message => message.messageType === ERSMessageTypeEnum.DEP.code)
            setDEPMessage(depMessage)

            let lanMessage = props.fishingActivities
                .find(message => message.messageType === ERSMessageTypeEnum.LAN.code)
            setLANMessage(lanMessage)

            let disMessages = props.fishingActivities
                .filter(message => message.messageType === ERSMessageTypeEnum.DIS.code)
            setDISMessages(disMessages)

            let pnoMessage = props.fishingActivities
                .find(message => message.messageType === ERSMessageTypeEnum.PNO.code)
            setPNOMessage(pnoMessage)

            let farMessages = props.fishingActivities
                .filter(message => message.messageType === ERSMessageTypeEnum.FAR.code)
            setFARMessages(farMessages)

            let totalFARAndDEPWeight = 0
            if(farMessages && farMessages.length) {
                let totalFARWeight = getTotalFARWeightFromMessages(farMessages)
                setTotalFARWeight(totalFARWeight)
                totalFARAndDEPWeight = totalFARWeight

                let speciesToWeightFARObject = {}
                farMessages.forEach(message => {
                    message.message.catches.forEach(speciesCatch => {
                        if (speciesToWeightFARObject[speciesCatch.species]) {
                            speciesToWeightFARObject[speciesCatch.species].weight += speciesCatch.weight
                        } else {
                            speciesToWeightFARObject[speciesCatch.species] = {
                                species: speciesCatch.species,
                                weight: speciesCatch.weight,
                                speciesName: speciesCatch.speciesName,
                                totalWeight: totalFARWeight
                            }
                        }
                    })
                })
                setSpeciesToWeightOfFAR(speciesToWeightFARObject)
            }

            if(depMessage) {
                let totalDEPWeight = getTotalDEPWeightFromMessages(depMessage)
                setTotalDEPWeight(totalDEPWeight)
                totalFARAndDEPWeight += totalDEPWeight
            }

            if(disMessages && disMessages.length) {
                let totalDISWeight = getTotalDISWeightFromMessages(disMessages)
                setTotalDISWeight(totalDISWeight)

                let speciesToWeightDISObject = {}
                disMessages.forEach(message => {
                    message.message.catches.forEach(speciesCatch => {
                        if (speciesToWeightDISObject[speciesCatch.species]) {
                            speciesToWeightDISObject[speciesCatch.species].weight += speciesCatch.weight
                        } else {
                            speciesToWeightDISObject[speciesCatch.species] = {
                                species: speciesCatch.species,
                                weight: speciesCatch.weight,
                                speciesName: speciesCatch.speciesName
                            }
                        }
                    })
                })
                setSpeciesToWeightOfDIS(speciesToWeightDISObject)
            }

            if(lanMessage) {
                let totalLANWeight = getTotalLANWeightFromMessages(lanMessage)
                setTotalLANWeight(totalLANWeight)

                let speciesToWeightLANObject = {}
                lanMessage.message.catchLanded.forEach(speciesCatch => {
                    if (speciesToWeightLANObject[speciesCatch.species]) {
                        speciesToWeightLANObject[speciesCatch.species].weight += speciesCatch.weight
                    } else {
                        speciesToWeightLANObject[speciesCatch.species] = {
                            species: speciesCatch.species,
                            weight: speciesCatch.weight,
                            speciesName: speciesCatch.speciesName
                        }
                    }
                })
                setSpeciesToWeightOfLAN(speciesToWeightLANObject)
            }

            if(pnoMessage) {
                let totalPNOWeight = getTotalPNOWeightFromMessages(pnoMessage)
                setTotalPNOWeight(totalPNOWeight)

                let speciesToWeightPNOObject = {}
                pnoMessage.message.catchOnboard.forEach(speciesCatch => {
                    if (speciesToWeightPNOObject[speciesCatch.species]) {
                        speciesToWeightPNOObject[speciesCatch.species].weight += speciesCatch.weight
                    } else {
                        speciesToWeightPNOObject[speciesCatch.species] = {
                            species: speciesCatch.species,
                            weight: speciesCatch.weight,
                            speciesName: speciesCatch.speciesName,
                            totalWeight: totalFARAndDEPWeight
                        }
                    }
                })
                setSpeciesToWeightOfPNO(speciesToWeightPNOObject)
            }

            setTotalFARAndDEPWeight(totalFARAndDEPWeight)

            const faoZones = farMessages
                .map(farMessage => {
                    return farMessage.message.catches.map(speciesCatch => speciesCatch.faoZone)
                })
                .flat()
                .reduce((acc, faoZone) => {
                    if(acc.indexOf(faoZone) < 0){
                        acc.push(faoZone)
                    }

                    return acc
                }, [])
            setFAOZones(faoZones)
        }
    }, [props.fishingActivities])

    function getTotalFARWeightFromMessages(ersMessages) {
        return ersMessages
            .reduce((accumulator, ersMessage) => {
            let sumOfCatches = ersMessage.message.catches.reduce((subAccumulator, speciesCatch) => {
                return subAccumulator + speciesCatch.weight
            }, 0)

            return accumulator + sumOfCatches
        }, 0);
    }

    function getTotalDEPWeightFromMessages(ersMessage) {
        return ersMessage.message.speciesOnboard.reduce((subAccumulator, speciesCatch) => {
            return subAccumulator + speciesCatch.weight
        }, 0)
    }

    function getTotalLANWeightFromMessages(ersMessage) {
        return ersMessage.message.catchLanded.reduce((subAccumulator, speciesCatch) => {
            return subAccumulator + speciesCatch.weight
        }, 0)
    }

    function getTotalPNOWeightFromMessages(ersMessage) {
        return ersMessage.message.catchOnboard.reduce((subAccumulator, speciesCatch) => {
            return subAccumulator + speciesCatch.weight
        }, 0)
    }

    function getTotalDISWeightFromMessages(ersMessages) {
        return ersMessages
            .reduce((accumulator, ersMessage) => {
                let sumOfCatches = ersMessage.message.catches.reduce((subAccumulator, speciesCatch) => {
                    return subAccumulator + speciesCatch.weight
                }, 0)

                return accumulator + sumOfCatches
            }, 0);
    }

    return <>
        { props.fishingActivities ?
                <Body>
                    <Zone>
                        <Title>
                            <Text>Segment(s) de flotte(s) actuel(s)</Text>
                            <TextValue>{props.fishingActivities.fleetSegment ? props.fishingActivities.fleetSegment : <NoValue>-</NoValue>}</TextValue>
                        </Title>
                        <Fields>
                            <TableBody>
                                <Field>
                                    <Key>Engins à bord (JPE)</Key>
                                    <Value>{depMessage &&
                                        depMessage.message &&
                                        depMessage.message.gearOnboard &&
                                        depMessage.message.gearOnboard.length ?
                                        depMessage.message.gearOnboard.map(gear => {
                                            return gear.gearName ?
                                                <span key={gear.gear}>{gear.gearName} ({gear.gear})<br/></span> :
                                                <span key={gear.gear}>{gear.gear}<br/></span>
                                        }) : <NoValue>-</NoValue>}</Value>
                                </Field>
                                <Field>
                                    <Key>Zones de la marée (JPE)</Key>
                                    <Value>{faoZones && faoZones.length ?
                                        faoZones.map((faoZone, index) => {
                                            return <span key={index}>{faoZone}{index === faoZones.length - 1 ? '' : ', '}</span>
                                        })
                                        : <NoValue>-</NoValue>}</Value>
                                </Field>
                            </TableBody>
                        </Fields>
                    </Zone>
                    <Zone>
                        <Title>
                            <Text>Licences</Text>
                            <TextValue>{props.fishingActivities.isExpired ? props.fishingActivities.isExpired : <NoValue>à venir</NoValue>}</TextValue>
                        </Title>
                    </Zone>
                    <Zone>
                        <Title>
                            <Text>Résumé de la marée</Text>
                            <TextValue>{props.fishingActivities.fleetSegment ? props.fishingActivities.fleetSegment : <NoValue>-</NoValue>}</TextValue>
                            <SeeAll onClick={() => props.showERSMessages()}>Voir tous<br/> les messages</SeeAll>
                            <Arrow onClick={() => props.showERSMessages()}/>
                        </Title>
                        {
                            props.fishingActivities && props.fishingActivities.length ?
                                <ERSMessages>
                                    {depMessage ? <DEPMessageResume
                                        showERSMessages={props.showERSMessages}
                                        depMessage={depMessage.message}/> :
                                        <DEPMessageResume hasNoMessage={true}/>
                                    }

                                    {farMessages && farMessages.length ? <FARMessageResume
                                        showERSMessages={props.showERSMessages}
                                        totalFARWeight={totalFARWeight}
                                        numberOfMessages={farMessages ? farMessages.length : 0}
                                        speciesToWeightOfFAR={speciesToWeightOfFAR}/> :
                                        <FARMessageResume hasNoMessage={true}/>
                                    }

                                    {disMessages && disMessages.length ? <DISMessageResume
                                        totalDISWeight={totalDISWeight}
                                        numberOfMessages={disMessages ? disMessages.length : 0}
                                        speciesToWeightOfDIS={speciesToWeightOfDIS}
                                        showERSMessages={props.showERSMessages}/> :
                                        <DISMessageResume hasNoMessage={true}/>
                                    }

                                    {pnoMessage ? <PNOMessageResume
                                        totalFARAndDEPWeight={totalFARAndDEPWeight}
                                        speciesToWeightOfPNO={speciesToWeightOfPNO}
                                        speciesToWeightOfFAR={speciesToWeightOfFAR}
                                        showERSMessages={props.showERSMessages}
                                        pnoMessage={pnoMessage}/> :
                                        <PNOMessageResume hasNoMessage={true}/>
                                    }

                                    {lanMessage ? <LANMessageResume
                                        totalLANWeight={totalLANWeight}
                                        totalPNOWeight={totalPNOWeight}
                                        speciesToWeightOfFAR={speciesToWeightOfFAR}
                                        speciesToWeightOfPNO={speciesToWeightOfPNO}
                                        speciesToWeightOfLAN={speciesToWeightOfLAN}
                                        showERSMessages={props.showERSMessages}
                                        lanMessage={lanMessage.message}/> :
                                        <LANMessageResume hasNoMessage={true}/>
                                    }
                                </ERSMessages> : null
                        }
                    </Zone>
                </Body> : null }
    </>
}

const Arrow = styled(ArrowSVG)`
  margin-left: 5px;
  order: 4;
  margin-top: 10px;
  cursor: pointer;
`

const SeeAll = styled.a`
  text-align: right;
  text-decoration: underline;
  font: normal 13px;
  line-height: 10px;
  color: ${COLORS.textGray};
  margin-left: auto;
  order: 3;
  margin-top: -6px;
  margin-bottom: 4px;
  cursor: pointer;
`

const ERSMessages = styled.ul`
  margin: 0 0 0 0;
  padding: 0;
  width: -moz-available;
`

const Text = styled.div`
  color: ${COLORS.textGray};
  font-size: 13px;
  font-weight: normal;
`

const TextValue = styled.div`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin: 0;
  padding-left: 20px;
`

const Body = styled.div`
  padding: 5px 5px 1px 5px;
  overflow-x: hidden;
`

const TableBody = styled.tbody``

const Title = styled.div`
  color: ${COLORS.textGray};
  background: ${COLORS.grayDarker};
  padding: 10px 10px 10px 20px;
  font-size: 0.8rem;
  flex-shrink: 0;
  flex-grow: 2;
  display: flex;
  width: 400px;
`

const Zone = styled.div`
  margin: 5px 5px 10px 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
`

const Fields = styled.table`
  padding: 10px 5px 5px 35px; 
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  margin-top: 5px;
  margin-bottom: 5px;
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
  color: ${COLORS.textBueGray};
  font-weight: 300;
  line-height: normal;
`

export default FishingActivitiesSummary
