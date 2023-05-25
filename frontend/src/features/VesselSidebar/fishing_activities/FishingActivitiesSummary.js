import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as ArrowSVG } from '../../icons/Picto_fleche-pleine-droite.svg'
import { ReactComponent as ArrowTripSVG } from '../../icons/Fleche_navigation_marees.svg'
import { ReactComponent as ArrowLastTripSVG } from '../../icons/Double_fleche_navigation_marees.svg'
import DEPMessageResume from './logbook_messages_resumes/DEPMessageResume'
import DISMessageResume from './logbook_messages_resumes/DISMessageResume'
import FARMessageResume from './logbook_messages_resumes/FARMessageResume'
import PNOMessageResume from './logbook_messages_resumes/PNOMessageResume'
import LANMessageResume from './logbook_messages_resumes/LANMessageResume'
import FleetSegments from '../../fleet_segments/FleetSegments'
import { useSelector } from 'react-redux'
import {
  getDEPMessageFromMessages,
  getDISMessagesFromMessages,
  getFAOZonesFromFARMessages,
  getFARMessagesFromMessages,
  getDISSpeciesToWeightObject,
  getFARSpeciesToWeightObject,
  getLANMessageFromMessages,
  getPNOMessageFromMessages,
  getSpeciesAndPresentationToWeightFARObject,
  getSpeciesToWeightLANObject,
  getSpeciesToWeightPNOObject,
  getTotalDEPWeightFromMessage,
  getTotalDISWeightFromMessages,
  getTotalFARWeightFromMessages,
  getTotalLANWeightFromMessage,
  getTotalPNOWeightFromMessage,
  LogbookOperationType,
  getAllFAROrDISMessagesAreNotAcknowledged
} from '../../../domain/entities/logbook/logbook'
import CustomDatesShowedInfo from './CustomDatesShowedInfo'
import { COMMON_ALERT_TYPE_OPTION } from '../../../domain/entities/alerts/constants'

const FishingActivitiesSummary = ({ showLogbookMessages, navigation, setProcessingMessagesResume }) => {
  const { selectedVessel } = useSelector(state => state.vessel)

  const { fishingActivities, tripNumber, isLastVoyage, isFirstVoyage } = useSelector(state => state.fishingActivities)

  const fleetSegments = useSelector(state => state.fleetSegment.fleetSegments)

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
  const [speciesAndPresentationToWeightOfFAR, setSpeciesAndPresentationToWeightOfFAR] = useState({})
  const [speciesToWeightOfPNO, setSpeciesToWeightOfPNO] = useState({})
  const [speciesToWeightOfDIS, setSpeciesToWeightOfDIS] = useState({})
  const [speciesToWeightOfLAN, setSpeciesToWeightOfLAN] = useState({})

  const [allFARMessagesAreNotAcknowledged, setAllFARMessagesAreNotAcknowledged] = useState(false)
  const [allDISMessagesAreNotAcknowledged, setAllDISMessagesAreNotAcknowledged] = useState(false)

  const [faoZones, setFAOZones] = useState([])

  useEffect(() => {
    if (fishingActivities?.logbookMessages?.length) {
      setProcessingMessagesResume(true)
      const logbookMessages = fishingActivities.logbookMessages
      const depMessage = getDEPMessageFromMessages(logbookMessages)
      setDEPMessage(depMessage)

      const lanMessage = getLANMessageFromMessages(logbookMessages)
      setLANMessage(lanMessage)

      const disMessages = getDISMessagesFromMessages(logbookMessages)
      setDISMessages(disMessages)

      const pnoMessage = getPNOMessageFromMessages(logbookMessages)
      setPNOMessage(pnoMessage)

      const farMessages = getFARMessagesFromMessages(logbookMessages)
      setFARMessages(farMessages)

      let totalFARAndDEPWeight = 0
      if (farMessages?.length) {
        const totalFARWeight = getTotalFARWeightFromMessages(farMessages)
        setTotalFARWeight(totalFARWeight)
        totalFARAndDEPWeight = totalFARWeight

        setAllFARMessagesAreNotAcknowledged(getAllFAROrDISMessagesAreNotAcknowledged(farMessages))
        const speciesToWeightFARObject = getFARSpeciesToWeightObject(farMessages, totalFARWeight)
        const speciesAndPresentationToWeightFARObject = getSpeciesAndPresentationToWeightFARObject(farMessages)
        setSpeciesToWeightOfFAR(speciesToWeightFARObject)
        setSpeciesAndPresentationToWeightOfFAR(speciesAndPresentationToWeightFARObject)
      }

      if (depMessage) {
        const totalDEPWeight = getTotalDEPWeightFromMessage(depMessage)
        totalFARAndDEPWeight += parseFloat(totalDEPWeight)
      }

      if (disMessages?.length) {
        const totalDISWeight = getTotalDISWeightFromMessages(disMessages)
        setTotalDISWeight(totalDISWeight)

        setAllDISMessagesAreNotAcknowledged(getAllFAROrDISMessagesAreNotAcknowledged(disMessages))
        const speciesToWeightDISObject = getDISSpeciesToWeightObject(disMessages, totalDISWeight)
        setSpeciesToWeightOfDIS(speciesToWeightDISObject)
      }

      if (lanMessage) {
        const totalLANWeight = getTotalLANWeightFromMessage(lanMessage)
        setTotalLANWeight(totalLANWeight)

        const speciesToWeightLANObject = getSpeciesToWeightLANObject(lanMessage)
        setSpeciesToWeightOfLAN(speciesToWeightLANObject)
      }

      if (pnoMessage) {
        const totalPNOWeight = getTotalPNOWeightFromMessage(pnoMessage)
        setTotalPNOWeight(totalPNOWeight)

        const speciesToWeightPNOObject = getSpeciesToWeightPNOObject(pnoMessage, totalPNOWeight)
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

      setSpeciesAndPresentationToWeightOfFAR({})
      setSpeciesToWeightOfPNO({})
      setSpeciesToWeightOfDIS({})
      setSpeciesToWeightOfLAN({})
      setFAOZones([])
    }

    setProcessingMessagesResume(false)
  }, [fishingActivities])

  const getCatchesOverToleranceAlert = () => {
    if (fishingActivities?.alerts?.length) {
      return fishingActivities.alerts.find(
        alert => alert?.value?.type === COMMON_ALERT_TYPE_OPTION.PNO_LAN_WEIGHT_TOLERANCE_ALERT.code
      ).value
    }

    return null
  }

  function getGears() {
    if (depMessage?.message?.gearOnboard?.length) {
      const uniqueGears = depMessage.message.gearOnboard.reduce((acc, current) => {
        const found = acc.find(item => item.gear === current.gear && item.gearName === current.gearName)
        if (!found) {
          return acc.concat([current])
        } else {
          return acc
        }
      }, [])

      return uniqueGears.map(gear => {
        return gear.gearName ? (
          <span key={gear.gear}>
            {gear.gearName} ({gear.gear})<br />
          </span>
        ) : (
          <span key={gear.gear}>
            {gear.gear}
            <br />
          </span>
        )
      })
    }

    return <NoValue>-</NoValue>
  }

  return (
    <>
      {fishingActivities ? (
        <Body>
          <Zone white>
            <Title>
              <Text>Segment(s) de flotte(s) actuel(s)</Text>
              <TextValue>
                <FleetSegments selectedVessel={selectedVessel} fleetSegmentsReferential={fleetSegments} />
              </TextValue>
            </Title>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Engins à bord (JPE)</Key>
                  <Value data-cy={'vessel-fishing-gears'}>{getGears()}</Value>
                </Field>
                <Field>
                  <Key>Zones de la marée (JPE)</Key>
                  <Value>
                    {faoZones?.length ? (
                      faoZones.map((faoZone, index) => {
                        return (
                          <span key={index}>
                            {faoZone}
                            {index === faoZones.length - 1 ? '' : ', '}
                          </span>
                        )
                      })
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
              </TableBody>
            </Fields>
          </Zone>
          <Zone>
            <Title hasTwoLines={false}>
              <Text hasTwoLines={false}>Résumé de la marée</Text>
              <TextValue hasTwoLines={false} data-cy={'vessel-fishing-trip-number'}>
                <PreviousTrip
                  disabled={isFirstVoyage}
                  onClick={!isFirstVoyage ? navigation.goToPreviousTrip : undefined}
                  title={'Marée précédente'}
                  data-cy={'vessel-fishing-previous-trip'}
                />
                {tripNumber ? `Marée n°${tripNumber}` : <NoValue>-</NoValue>}
                <NextTrip
                  disabled={isLastVoyage}
                  onClick={!isLastVoyage ? navigation.goToNextTrip : undefined}
                  title={'Marée suivante'}
                />
                <LastTrip
                  disabled={isLastVoyage}
                  onClick={!isLastVoyage ? navigation.goToLastTrip : undefined}
                  title={'Dernière marée'}
                  data-cy={'vessel-fishing-next-trip'}
                />
              </TextValue>
              <SeeAll onClick={() => showLogbookMessages()} data-cy={'vessel-fishing-see-all'}>
                Voir tous les messages
              </SeeAll>
              <Arrow onClick={() => showLogbookMessages()} />
            </Title>
            <CustomDatesShowedInfo />
            {fishingActivities?.logbookMessages?.length ? (
              <LogbookMessages>
                {depMessage ? (
                  <DEPMessageResume
                    id={depMessage.reportId}
                    showLogbookMessages={showLogbookMessages}
                    depMessage={depMessage.message}
                    isNotAcknowledged={depMessage.acknowledge && depMessage.acknowledge.isSuccess === false}
                    isDeleted={depMessage.deleted}
                    rejectionCause={
                      depMessage.acknowledge && depMessage.acknowledge.rejectionCause
                        ? depMessage.acknowledge.rejectionCause
                        : null
                    }
                  />
                ) : (
                  <DEPMessageResume hasNoMessage={true} />
                )}

                {farMessages?.length && farMessages[0] ? (
                  <FARMessageResume
                    id={farMessages[0].reportId}
                    showLogbookMessages={showLogbookMessages}
                    totalFARWeight={totalFARWeight}
                    numberOfMessages={
                      farMessages
                        ? farMessages.filter(message => message.operationType === LogbookOperationType.DAT).length
                        : 0
                    }
                    speciesToWeightOfFAR={speciesToWeightOfFAR}
                    speciesAndPresentationToWeightOfFAR={speciesAndPresentationToWeightOfFAR}
                    allFARMessagesAreNotAcknowledged={allFARMessagesAreNotAcknowledged}
                  />
                ) : (
                  <FARMessageResume hasNoMessage={true} />
                )}

                {disMessages?.length && disMessages[0] ? (
                  <DISMessageResume
                    id={disMessages[0].reportId}
                    totalDISWeight={totalDISWeight}
                    numberOfMessages={
                      disMessages
                        ? disMessages.filter(message => message.operationType === LogbookOperationType.DAT).length
                        : 0
                    }
                    speciesToWeightOfDIS={speciesToWeightOfDIS}
                    showLogbookMessages={showLogbookMessages}
                    allDISMessagesAreNotAcknowledged={allDISMessagesAreNotAcknowledged}
                  />
                ) : (
                  <DISMessageResume hasNoMessage={true} />
                )}

                {pnoMessage ? (
                  <PNOMessageResume
                    id={pnoMessage.reportId}
                    totalPNOWeight={totalPNOWeight}
                    totalFARAndDEPWeight={totalFARAndDEPWeight}
                    speciesToWeightOfPNO={speciesToWeightOfPNO}
                    speciesToWeightOfFAR={speciesToWeightOfFAR}
                    showLogbookMessages={showLogbookMessages}
                    isNotAcknowledged={pnoMessage.acknowledge && pnoMessage.acknowledge.isSuccess === false}
                    isDeleted={pnoMessage.deleted}
                    pnoMessage={pnoMessage}
                  />
                ) : (
                  <PNOMessageResume hasNoMessage={true} />
                )}

                {lanMessage ? (
                  <LANMessageResume
                    id={lanMessage.reportId}
                    catchesOverToleranceAlert={getCatchesOverToleranceAlert()}
                    totalLANWeight={totalLANWeight}
                    totalPNOWeight={totalPNOWeight}
                    speciesToWeightOfFAR={speciesToWeightOfFAR}
                    speciesToWeightOfPNO={speciesToWeightOfPNO}
                    speciesToWeightOfLAN={speciesToWeightOfLAN}
                    showLogbookMessages={showLogbookMessages}
                    isNotAcknowledged={lanMessage.acknowledge && lanMessage.acknowledge.isSuccess === false}
                    isDeleted={lanMessage.deleted}
                    lanMessage={lanMessage.message}
                  />
                ) : (
                  <LANMessageResume hasNoMessage={true} />
                )}
              </LogbookMessages>
            ) : (
              <NoMessage>Aucun message reçu</NoMessage>
            )}
          </Zone>
        </Body>
      ) : null}
    </>
  )
}

const PreviousTrip = styled(ArrowTripSVG)`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: sub;
  width: 14px;
  margin-right: 10px;
  transform: rotate(180deg);
`

const NextTrip = styled(ArrowTripSVG)`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: sub;
  width: 14px;
  margin-left: 10px;
`

const LastTrip = styled(ArrowLastTripSVG)`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: sub;
  width: 14px;
  margin-left: 5px;
`

const NoMessage = styled.div`
  text-align: center;
  margin-top: 20px;
  padding-bottom: 20px;
  font-size: 13px;
  color: ${COLORS.slateGray};
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
  color: ${COLORS.slateGray};
  margin-left: auto;
  order: 3;
  cursor: pointer;
  width: 70px;
`

const LogbookMessages = styled.ul`
  margin: 0 0 0 0;
  padding: 0;
  width: -moz-available;
  width: -webkit-fill-available;
`

const Text = styled.div`
  color: ${COLORS.slateGray};
  font-size: 13px;
  font-weight: 500;
  padding-top: ${props => (props.hasTwoLines ? '6px' : '0')};
`

const TextValue = styled.div`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  font-weight: 500;
  margin: 0;
  padding-left: 10px;
  padding-top: ${props => (props.hasTwoLines ? '6px' : '0')};
`

const Body = styled.div`
  padding: 5px 5px 1px 5px;
`

const TableBody = styled.tbody``

const Title = styled.div`
  color: ${COLORS.slateGray};
  background: ${COLORS.lightGray};
  padding: ${props => (props.hasTwoLines ? '7px 10px 7px 20px;' : '8.5px 10px 8px 20px;')}
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
  background: ${props => (props.white ? COLORS.white : 'unset')};
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
  color: ${COLORS.slateGray};
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
  color: ${COLORS.gunMetal};
  font-weight: 500;
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
`

export default FishingActivitiesSummary
