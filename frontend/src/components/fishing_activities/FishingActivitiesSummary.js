import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { ReactComponent as ArrowSVG } from '../icons/Picto_fleche-pleine-droite.svg'
import { ReactComponent as ArrowTripSVG } from '../icons/Fleche_navigation_marees.svg'
import { ReactComponent as ArrowLastTripSVG } from '../icons/Double_fleche_navigation_marees.svg'
import DEPMessageResume from './ers_messages_resumes/DEPMessageResume'
import DISMessageResume from './ers_messages_resumes/DISMessageResume'
import FARMessageResume from './ers_messages_resumes/FARMessageResume'
import PNOMessageResume from './ers_messages_resumes/PNOMessageResume'
import LANMessageResume from './ers_messages_resumes/LANMessageResume'
import { AlertTypes } from '../../domain/entities/alerts'
import FleetSegments from '../fleet_segments/FleetSegments'
import { useSelector } from 'react-redux'
import {
  getDEPMessageFromMessages,
  getDISMessagesFromMessages,
  getFAOZonesFromFARMessages,
  getFARMessagesFromMessages,
  getLANMessageFromMessages,
  getPNOMessageFromMessages,
  getSpeciesToWeightDISObject,
  getSpeciesToWeightFARObject,
  getSpeciesToWeightLANObject,
  getSpeciesToWeightPNOObject,
  getTotalDEPWeightFromMessages,
  getTotalDISWeightFromMessages,
  getTotalFARWeightFromMessages,
  getTotalLANWeightFromMessages,
  getTotalPNOWeightFromMessages
} from '../../domain/entities/fishingActivities'

const FishingActivitiesSummary = ({ showERSMessages, fishingActivities, fleetSegments, vesselLastPositionFeature, navigation }) => {
  const {
    isLastVoyage,
    previousBeforeDateTime
  } = useSelector(state => state.vessel)

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
    if (fishingActivities && fishingActivities.ersMessages && fishingActivities.ersMessages.length) {
      const ersMessages = fishingActivities.ersMessages
      const depMessage = getDEPMessageFromMessages(ersMessages)
      setDEPMessage(depMessage)

      const lanMessage = getLANMessageFromMessages(ersMessages, depMessage)
      setLANMessage(lanMessage)

      const disMessages = getDISMessagesFromMessages(ersMessages)
      setDISMessages(disMessages)

      const pnoMessage = getPNOMessageFromMessages(ersMessages)
      setPNOMessage(pnoMessage)

      const farMessages = getFARMessagesFromMessages(ersMessages)
      setFARMessages(farMessages)

      let totalFARAndDEPWeight = 0
      if (farMessages && farMessages.length) {
        const totalFARWeight = getTotalFARWeightFromMessages(farMessages)
        setTotalFARWeight(totalFARWeight)
        totalFARAndDEPWeight = totalFARWeight

        const speciesToWeightFARObject = getSpeciesToWeightFARObject(farMessages, totalFARWeight)
        setSpeciesToWeightOfFAR(speciesToWeightFARObject)
      }

      if (depMessage) {
        const totalDEPWeight = getTotalDEPWeightFromMessages(depMessage)
        totalFARAndDEPWeight += parseFloat(totalDEPWeight)
      }

      if (disMessages && disMessages.length) {
        const totalDISWeight = getTotalDISWeightFromMessages(disMessages)
        setTotalDISWeight(totalDISWeight)

        const speciesToWeightDISObject = getSpeciesToWeightDISObject(disMessages, totalDISWeight)
        setSpeciesToWeightOfDIS(speciesToWeightDISObject)
      }

      if (lanMessage) {
        const totalLANWeight = getTotalLANWeightFromMessages(lanMessage)
        setTotalLANWeight(totalLANWeight)

        const speciesToWeightLANObject = getSpeciesToWeightLANObject(lanMessage)
        setSpeciesToWeightOfLAN(speciesToWeightLANObject)
      }

      if (pnoMessage) {
        const totalPNOWeight = getTotalPNOWeightFromMessages(pnoMessage)
        setTotalPNOWeight(totalPNOWeight)

        const speciesToWeightPNOObject = getSpeciesToWeightPNOObject(pnoMessage, totalFARAndDEPWeight)
        setSpeciesToWeightOfPNO(speciesToWeightPNOObject)
      }

      setTotalFARAndDEPWeight(totalFARAndDEPWeight)

      const faoZones = getFAOZonesFromFARMessages(farMessages)
      setFAOZones(faoZones)
    } else {
      setDEPMessage(null)
      setLANMessage(null)
      setPNOMessage(null)
      setFARMessages(null)
      setDISMessages(null)

      setTotalFARWeight(null)
      setTotalDISWeight(null)
      setTotalLANWeight(null)
      setTotalPNOWeight(null)
      setTotalFARAndDEPWeight(null)

      setSpeciesToWeightOfFAR({})
      setSpeciesToWeightOfPNO({})
      setSpeciesToWeightOfDIS({})
      setSpeciesToWeightOfLAN({})
    }
  }, [fishingActivities])

  const getCatchesOverToleranceAlert = () => {
    if (fishingActivities.alerts && fishingActivities.alerts.length) {
      return fishingActivities.alerts.find(alert => alert.name === AlertTypes.PNO_LAN_WEIGHT_TOLERANCE_ALERT.code).value
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
    {fishingActivities
      ? <Body>
        <Zone>
          <Title>
            <Text>Segment(s) de flotte(s) actuel(s)</Text>
            <TextValue>
              <FleetSegments
                vesselLastPositionFeature={vesselLastPositionFeature}
                fleetSegmentsReferential={fleetSegments}
              />
            </TextValue>
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
            <TextValue>{fishingActivities.isExpired
              ? fishingActivities.isExpired
              : <NoValue>à venir</NoValue>}</TextValue>
          </Title>
        </Zone>
        <Zone>
          <Title hasTwoLines={false}>
            <Text hasTwoLines={false}>Résumé de la marée</Text>
            <TextValue hasTwoLines={false}>
              <PreviousTrip
                disabled={!previousBeforeDateTime}
                onClick={previousBeforeDateTime && navigation.goToPreviousTrip}
                title={'Marée précédente'}
              />
              {
                depMessage && depMessage.tripNumber
                  ? `Marée n°${depMessage.tripNumber}`
                  : <NoValue>-</NoValue>
              }
              <NextTrip
                disabled={isLastVoyage}
                onClick={!isLastVoyage && navigation.goToNextTrip}
                title={'Marée suivante'}
              />
              <LastTrip
                disabled={isLastVoyage}
                onClick={!isLastVoyage && navigation.goToLastTrip}
                title={'Dernière marée'}
              />
            </TextValue>
            <SeeAll onClick={() => showERSMessages()}>Voir tous les messages</SeeAll>
            <Arrow onClick={() => showERSMessages()}/>
          </Title>
          {
            fishingActivities && fishingActivities.ersMessages && fishingActivities.ersMessages.length
              ? <ERSMessages>
                {depMessage
                  ? <DEPMessageResume
                    id={depMessage.ersId}
                    showERSMessages={showERSMessages}
                    depMessage={depMessage.message}
                    isNotAcknowledged={depMessage.acknowledge && depMessage.acknowledge.isSuccess === false}
                    isDeleted={depMessage.deleted}
                    rejectionCause={depMessage.acknowledge && depMessage.acknowledge.rejectionCause ? depMessage.acknowledge.rejectionCause : null}/>
                  : <DEPMessageResume hasNoMessage={true}/>
                }

                {farMessages && farMessages.length && farMessages[0]
                  ? <FARMessageResume
                    id={farMessages[0].ersId}
                    showERSMessages={showERSMessages}
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
                    showERSMessages={showERSMessages}/>
                  : <DISMessageResume hasNoMessage={true}/>
                }

                {pnoMessage
                  ? <PNOMessageResume
                    id={pnoMessage.ersId}
                    totalFARAndDEPWeight={totalFARAndDEPWeight}
                    speciesToWeightOfPNO={speciesToWeightOfPNO}
                    speciesToWeightOfFAR={speciesToWeightOfFAR}
                    showERSMessages={showERSMessages}
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
                    showERSMessages={showERSMessages}
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

const PreviousTrip = styled(ArrowTripSVG)`
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  vertical-align: sub;
  width: 14px;
  margin-right: 10px;
  transform: rotate(180deg);
`

const NextTrip = styled(ArrowTripSVG)`
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  vertical-align: sub;
  width: 14px;
  margin-left: 10px;
`

const LastTrip = styled(ArrowLastTripSVG)`
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  vertical-align: sub;
  width: 14px;
  margin-left: 5px;
`

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
  margin-top: 4px;
  cursor: pointer;
`

const SeeAll = styled.a`
  text-align: right;
  text-decoration: none;
  font-size: 11px;
  line-height: 10px;
  color: ${COLORS.textGray};
  margin-left: auto;
  order: 3;
  cursor: pointer;
  width: 70px;
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
  padding-left: 10px;
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
  font-size: 13px;
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
