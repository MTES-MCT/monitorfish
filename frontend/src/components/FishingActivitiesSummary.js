import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../constants/constants";
import {ERSMessageType as ERSMessageTypeEnum} from "../domain/entities/ERS";
import ERSMessageResume from "./ers_messages_resumes/ERSMessageResume";

const FishingActivitiesSummary = props => {
    const [depMessage, setDEPMessage] = useState(null)
    const [pnoMessage, setPNOMessage] = useState(null)
    const [farMessages, setFARMessages] = useState(null)
    const [disMessages, setDISMessages] = useState(null)
    const [faoZones, setFAOZones] = useState([])

    useEffect(() => {
        if(props.fishingActivities && props.fishingActivities.length) {
            setDEPMessage(props.fishingActivities
                .find(message => message.messageType === ERSMessageTypeEnum.DEP.code))
            setDISMessages(props.fishingActivities
                .filter(message => message.messageType === ERSMessageTypeEnum.DIS.code))
            setPNOMessage(props.fishingActivities
                .find(message => message.messageType === ERSMessageTypeEnum.PNO.code))

            let farMessages = props.fishingActivities
                .filter(message => message.messageType === ERSMessageTypeEnum.FAR.code);
            setFARMessages(farMessages)

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
                        </Title>
                        {
                            props.fishingActivities && props.fishingActivities.length ?
                                <ERSMessages>
                                    {depMessage ? <ERSMessageResume ersMessages={[depMessage]}/> : null}
                                    {farMessages && farMessages.length ? <ERSMessageResume ersMessages={farMessages}/> : null}
                                    {disMessages && disMessages.length ? <ERSMessageResume ersMessages={disMessages}/> : null}
                                    {pnoMessage ? <ERSMessageResume ersMessages={[pnoMessage, ...farMessages]}/> : null}
                                </ERSMessages> : null
                        }
                    </Zone>
                </Body> : null }
    </>
}

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
  color: ${COLORS.textBueGray};
  font-weight: 300;
  line-height: normal;
`

export default FishingActivitiesSummary
