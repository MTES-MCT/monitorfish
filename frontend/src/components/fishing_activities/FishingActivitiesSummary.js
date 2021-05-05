import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ERSMessageType as ERSMessageTypeEnum } from '../../domain/entities/ERS'
import { ReactComponent as ArrowSVG } from '../icons/Picto_fleche-pleine-droite.svg'
import DEPMessageResume from './ers_messages_resumes/DEPMessageResume'
import DISMessageResume from './ers_messages_resumes/DISMessageResume'
import FARMessageResume from './ers_messages_resumes/FARMessageResume'
import PNOMessageResume from './ers_messages_resumes/PNOMessageResume'
import LANMessageResume from './ers_messages_resumes/LANMessageResume'
import { AlertTypes } from '../../domain/entities/alerts'

const FishingActivitiesSummary = props => {
  const [depMessage, setDEPMessage] = useState(null)
  const [lanMessage, setLANMessage] = useState(null)
  const [pnoMessage, setPNOMessage] = useState(null)
  const [farMessages, setFARMessages] = useState(null)
  const [disMessages, setDISMessages] = useState(null)

  const [totalFARWeight, setTotalFARWeight] = useState(null)
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
    if (props.fishingActivities && props.fishingActivities.ersMessages && props.fishingActivities.ersMessages.length) {
      const ersMessages = props.fishingActivities.ersMessages

      const depMessage = ersMessages
        .find(message => message.messageType === ERSMessageTypeEnum.DEP.code)
      setDEPMessage(depMessage)

      const lanMessage = ersMessages
        .find(message => message.messageType === ERSMessageTypeEnum.LAN.code)
      setLANMessage(lanMessage)

      const disMessages = ersMessages
        .filter(message => message.messageType === ERSMessageTypeEnum.DIS.code)
      setDISMessages(disMessages)

      const pnoMessage = ersMessages
        .find(message => message.messageType === ERSMessageTypeEnum.PNO.code)
      setPNOMessage(pnoMessage)

      const farMessages = ersMessages
        .filter(message => message.messageType === ERSMessageTypeEnum.FAR.code)
      setFARMessages(farMessages)

      let totalFARAndDEPWeight = 0
      if (farMessages && farMessages.length) {
        const totalFARWeight = getTotalFARWeightFromMessages(farMessages)
        setTotalFARWeight(totalFARWeight)
        totalFARAndDEPWeight = totalFARWeight

        const speciesToWeightFARObject = {}
        farMessages.forEach(message => {
          message.message.catches.forEach(speciesCatch => {
            if (speciesToWeightFARObject[speciesCatch.species]) {
              speciesToWeightFARObject[speciesCatch.species].weight = parseFloat((
                speciesToWeightFARObject[speciesCatch.species].weight +
                                (speciesCatch.weight ? parseFloat(speciesCatch.weight) : 0)).toFixed(1))
            } else {
              speciesToWeightFARObject[speciesCatch.species] = {
                species: speciesCatch.species,
                weight: speciesCatch.weight ? parseFloat(speciesCatch.weight.toFixed(1)) : 0,
                speciesName: speciesCatch.speciesName,
                totalWeight: totalFARWeight
              }
            }
          })
        })
        setSpeciesToWeightOfFAR(speciesToWeightFARObject)
      }

      if (depMessage) {
        const totalDEPWeight = getTotalDEPWeightFromMessages(depMessage)
        totalFARAndDEPWeight += parseFloat(totalDEPWeight)
      }

      if (disMessages && disMessages.length) {
        const totalDISWeight = getTotalDISWeightFromMessages(disMessages)
        setTotalDISWeight(totalDISWeight)

        const speciesToWeightDISObject = {}
        disMessages.forEach(message => {
          message.message.catches.forEach(speciesCatch => {
            if (speciesToWeightDISObject[speciesCatch.species]) {
              speciesToWeightDISObject[speciesCatch.species].weight = parseFloat((
                speciesToWeightDISObject[speciesCatch.species].weight +
                              (speciesCatch.weight ? parseFloat(speciesCatch.weight) : 0)).toFixed(1))
            } else {
              speciesToWeightDISObject[speciesCatch.species] = {
                species: speciesCatch.species,
                weight: speciesCatch.weight ? parseFloat(speciesCatch.weight.toFixed(1)) : 0,
                speciesName: speciesCatch.speciesName,
                totalWeight: totalDISWeight
              }
            }
          })
        })
        setSpeciesToWeightOfDIS(speciesToWeightDISObject)
      }

      if (lanMessage) {
        const totalLANWeight = getTotalLANWeightFromMessages(lanMessage)
        setTotalLANWeight(totalLANWeight)

        const speciesToWeightLANObject = {}
        lanMessage.message.catchLanded.forEach(speciesCatch => {
          // TODO Regarder le calcul de la somme du LAN pour chaue espèce, ça semble trop élevé en env de DEV
          if (speciesToWeightLANObject[speciesCatch.species]) {
            speciesToWeightLANObject[speciesCatch.species].weight = parseFloat((
              speciesToWeightLANObject[speciesCatch.species].weight +
                            (speciesCatch.weight ? parseFloat(speciesCatch.weight) : 0)).toFixed(1))
          } else {
            speciesToWeightLANObject[speciesCatch.species] = {
              species: speciesCatch.species,
              weight: speciesCatch.weight ? parseFloat(speciesCatch.weight.toFixed(1)) : 0,
              speciesName: speciesCatch.speciesName
            }
          }
        })
        setSpeciesToWeightOfLAN(speciesToWeightLANObject)
      }

      if (pnoMessage) {
        const totalPNOWeight = getTotalPNOWeightFromMessages(pnoMessage)
        setTotalPNOWeight(totalPNOWeight)

        const speciesToWeightPNOObject = {}
        pnoMessage.message.catchOnboard.forEach(speciesCatch => {
          if (speciesToWeightPNOObject[speciesCatch.species]) {
            speciesToWeightPNOObject[speciesCatch.species].weight = parseFloat((
              speciesToWeightPNOObject[speciesCatch.species].weight +
                           (speciesCatch.weight ? parseFloat(speciesCatch.weight) : 0)).toFixed(1))
          } else {
            speciesToWeightPNOObject[speciesCatch.species] = {
              species: speciesCatch.species,
              weight: speciesCatch.weight ? parseFloat(speciesCatch.weight.toFixed(1)) : 0,
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
          if (acc.indexOf(faoZone) < 0) {
            acc.push(faoZone)
          }

          return acc
        }, [])
      setFAOZones(faoZones)
    }
  }, [props.fishingActivities])

  function getTotalFARWeightFromMessages (ersMessages) {
    return parseFloat(ersMessages
      .reduce((accumulator, ersMessage) => {
        const sumOfCatches = ersMessage.acknowledge && ersMessage.acknowledge.isSuccess
          ? ersMessage.message.catches.reduce((subAccumulator, speciesCatch) => {
            return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
          }, 0)
          : 0
        return accumulator + sumOfCatches
      }, 0).toFixed(1))
  }

  function getTotalDEPWeightFromMessages (ersMessage) {
    return parseFloat(ersMessage.message.speciesOnboard.reduce((subAccumulator, speciesCatch) => {
      return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
    }, 0).toFixed(1))
  }

  function getTotalLANWeightFromMessages (ersMessage) {
    return parseFloat(ersMessage.message.catchLanded.reduce((subAccumulator, speciesCatch) => {
      return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
    }, 0).toFixed(1))
  }

  function getTotalPNOWeightFromMessages (ersMessage) {
    return parseFloat(ersMessage.message.catchOnboard.reduce((subAccumulator, speciesCatch) => {
      return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
    }, 0).toFixed(1))
  }

  function getTotalDISWeightFromMessages (ersMessages) {
    return parseFloat(ersMessages
      .reduce((accumulator, ersMessage) => {
        const sumOfCatches = ersMessage.message.catches.reduce((subAccumulator, speciesCatch) => {
          return subAccumulator + (speciesCatch.weight ? speciesCatch.weight : 0)
        }, 0)

        return accumulator + sumOfCatches
      }, 0).toFixed(1))
  }

  const getCatchesOverToleranceAlert = () => {
    if (props.fishingActivities.alerts && props.fishingActivities.alerts.length) {
      return props.fishingActivities.alerts.find(alert => alert.name === AlertTypes.PNO_LAN_WEIGHT_TOLERANCE_ALERT.code).value
    }

    return null
  }

  function getGears () {
    if (depMessage &&
          depMessage.message &&
          depMessage.message.gearOnboard &&
          depMessage.message.gearOnboard.length) {
      const uniqueGears = depMessage.message.gearOnboard.reduce((acc, current) => {
        const found = acc.find(item =>
          item.gear === current.gear &&
                  item.gearName === current.gearName)
        if (!found) {
          return acc.concat([current])
        } else {
          return acc
        }
      }, [])

      return uniqueGears.map(gear => {
        return gear.gearName
          ? <span key={gear.gear}>{gear.gearName} ({gear.gear})<br/></span>
          : <span key={gear.gear}>{gear.gear}<br/></span>
      })
    }

    return <NoValue>-</NoValue>
  }

  return <>
        {props.fishingActivities
          ? <Body>
                <Zone>
                    <Title>
                        <Text>Segment(s) de flotte(s) actuel(s)</Text>
                        <TextValue>{props.fishingActivities.fleetSegment
                          ? props.fishingActivities.fleetSegment
                          : <NoValue>-</NoValue>}</TextValue>
                    </Title>
                    <Fields>
                        <TableBody>
                            <Field>
                                <Key>Engins à bord (JPE)</Key>
                                <Value>
                                    {
                                        getGears()
                                    }
                                </Value>
                            </Field>
                            <Field>
                                <Key>Zones de la marée (JPE)</Key>
                                <Value>{faoZones && faoZones.length
                                  ? faoZones.map((faoZone, index) => {
                                    return <span
                                            key={index}>{faoZone}{index === faoZones.length - 1 ? '' : ', '}</span>
                                  })
                                  : <NoValue>-</NoValue>}</Value>
                            </Field>
                        </TableBody>
                    </Fields>
                </Zone>
                <Zone>
                    <Title>
                        <Text>Licences</Text>
                        <TextValue>{props.fishingActivities.isExpired
                          ? props.fishingActivities.isExpired
                          : <NoValue>à venir</NoValue>}</TextValue>
                    </Title>
                </Zone>
                <Zone>
                    <Title hasTwoLines={true}>
                        <Text hasTwoLines={true}>Résumé de la marée</Text>
                        <TextValue
                            hasTwoLines={true}>{props.fishingActivities.fleetSegment
                              ? props.fishingActivities.fleetSegment
                              : <NoValue>-</NoValue>}</TextValue>
                        <SeeAll onClick={() => props.showERSMessages()}>Voir tous<br/> les messages</SeeAll>
                        <Arrow onClick={() => props.showERSMessages()}/>
                    </Title>
                    {
                        props.fishingActivities && props.fishingActivities.ersMessages && props.fishingActivities.ersMessages.length
                          ? <ERSMessages>
                                {depMessage
                                  ? <DEPMessageResume
                                        id={depMessage.ersId}
                                        showERSMessages={props.showERSMessages}
                                        depMessage={depMessage.message}
                                        isNotAcknowledged={depMessage.acknowledge && depMessage.acknowledge.isSuccess === false}
                                        isDeleted={depMessage.deleted}
                                        rejectionCause={depMessage.acknowledge && depMessage.acknowledge.rejectionCause ? depMessage.acknowledge.rejectionCause : null}/>
                                  : <DEPMessageResume hasNoMessage={true}/>
                                }

                                {farMessages && farMessages.length && farMessages[0]
                                  ? <FARMessageResume
                                        id={farMessages[0].ersId}
                                        showERSMessages={props.showERSMessages}
                                        totalFARWeight={totalFARWeight}
                                        numberOfMessages={farMessages ? farMessages.length : 0}
                                        speciesToWeightOfFAR={speciesToWeightOfFAR}/>
                                  : <FARMessageResume hasNoMessage={true}/>
                                }

                                {disMessages && disMessages.length && disMessages[0]
                                  ? <DISMessageResume
                                        id={disMessages[0].ersId}
                                        totalDISWeight={totalDISWeight}
                                        numberOfMessages={disMessages ? disMessages.length : 0}
                                        speciesToWeightOfDIS={speciesToWeightOfDIS}
                                        showERSMessages={props.showERSMessages}/>
                                  : <DISMessageResume hasNoMessage={true}/>
                                }

                                {pnoMessage
                                  ? <PNOMessageResume
                                        id={pnoMessage.ersId}
                                        totalFARAndDEPWeight={totalFARAndDEPWeight}
                                        speciesToWeightOfPNO={speciesToWeightOfPNO}
                                        speciesToWeightOfFAR={speciesToWeightOfFAR}
                                        showERSMessages={props.showERSMessages}
                                        isNotAcknowledged={pnoMessage.acknowledge && pnoMessage.acknowledge.isSuccess === false}
                                        isDeleted={pnoMessage.deleted}
                                        pnoMessage={pnoMessage}/>
                                  : <PNOMessageResume hasNoMessage={true}/>
                                }

                                {lanMessage
                                  ? <LANMessageResume
                                        id={lanMessage.ersId}
                                        catchesOverToleranceAlert={getCatchesOverToleranceAlert()}
                                        totalLANWeight={totalLANWeight}
                                        totalPNOWeight={totalPNOWeight}
                                        speciesToWeightOfFAR={speciesToWeightOfFAR}
                                        speciesToWeightOfPNO={speciesToWeightOfPNO}
                                        speciesToWeightOfLAN={speciesToWeightOfLAN}
                                        showERSMessages={props.showERSMessages}
                                        isNotAcknowledged={lanMessage.acknowledge && lanMessage.acknowledge.isSuccess === false}
                                        isDeleted={lanMessage.deleted}
                                        lanMessage={lanMessage.message}/>
                                  : <LANMessageResume hasNoMessage={true}/>
                                }
                            </ERSMessages>
                          : <NoMessage>Aucun message reçu</NoMessage>
                    }
                </Zone>
            </Body>
          : null}
    </>
}

const NoMessage = styled.div`
  text-align: center;
  margin-top: 20px;
  padding-bottom: 20px;
  font-size: 13px;
  color: ${COLORS.textGray};
  width: 100%;
`

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
  width: -webkit-fill-available;
`

const Text = styled.div`
  color: ${COLORS.textGray};
  font-size: 13px;
  font-weight: 500;
  padding-top: ${props => props.hasTwoLines ? '6px' : '0'};
`

const TextValue = styled.div`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin: 0;
  padding-left: 20px;
  padding-top: ${props => props.hasTwoLines ? '6px' : '0'};
`

const Body = styled.div`
  padding: 5px 5px 1px 5px;
  overflow-x: hidden;
`

const TableBody = styled.tbody``

const Title = styled.div`
  color: ${COLORS.textGray};
  background: ${COLORS.grayDarker};
  padding: ${props => props.hasTwoLines ? '7px 10px 7px 20px;' : '8.5px 10px 8px 20px;'}
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
  background: ${COLORS.background};
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
  color: ${COLORS.grayDarkerTwo};
  font-weight: 300;
  line-height: normal;
`

export default FishingActivitiesSummary
