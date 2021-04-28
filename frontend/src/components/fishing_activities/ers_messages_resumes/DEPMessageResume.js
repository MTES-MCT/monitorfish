import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { getDateTime } from '../../../utils'
import ERSMessageResumeHeader from './ERSMessageResumeHeader'
import { ERSMessageType as ERSMessageTypeEnum } from '../../../domain/entities/ERS'

const DEPMessageResume = props => {
  const [isOpen, setIsOpen] = useState(false)
  const firstUpdate = useRef(true)

  useEffect(() => {
    if (isOpen) {
      firstUpdate.current = false
    }
  }, [isOpen])

  const getDEPMessageResumeTitleText = () => {
    return `${props.depMessage.departurePortName ? props.depMessage.departurePortName : props.depMessage.departurePort} le ${getDateTime(props.depMessage.departureDatetimeUtc, true)} (UTC)`
  }

  const getDEPMessageResumeTitle = () => {
    return <>{props.depMessage.departurePortName ? props.depMessage.departurePortName : props.depMessage.departurePort}
            {' '}le {getDateTime(props.depMessage.departureDatetimeUtc, true)} <Gray>(UTC)</Gray></>
  }

  return <>
        <Wrapper>
            <ERSMessageResumeHeader
                isNotAcknowledged={props.isNotAcknowledged}
                isDeleted={props.isDeleted}
                rejectionCause={props.rejectionCause}
                onHoverText={props.hasNoMessage ? null : getDEPMessageResumeTitleText()}
                title={props.hasNoMessage ? null : getDEPMessageResumeTitle()}
                hasNoMessage={props.hasNoMessage}
                showERSMessages={props.showERSMessages}
                messageType={ERSMessageTypeEnum.DEP.code.toString()}
                setIsOpen={setIsOpen}
                isOpen={isOpen}/>
            {
                props.hasNoMessage
                  ? null
                  : <ERSMessageContent
                        id={props.id}
                        speciesOnboard={(props.depMessage.speciesOnboard && props.depMessage.speciesOnboard.length > 0) ? props.depMessage.speciesOnboard.length : 1}
                        gearOnboard={props.depMessage.gearOnboard ? props.depMessage.gearOnboard.length : 1}
                        firstUpdate={firstUpdate}
                        isOpen={isOpen}
                        name={ERSMessageTypeEnum.DEP.code.toString()}>
                        <Zone>
                            {props.depMessage.gearOnboard && props.depMessage.gearOnboard.length
                              ? props.depMessage.gearOnboard.map((gear, index) => {
                                return <Gear key={gear.gear} isFirst={index === '0'}>
                                        <SubKey>Engin à bord {index + 1}</SubKey>{' '}
                                        <SubValue>
                                            {
                                                gear.gearName
                                                  ? <>{gear.gearName} ({gear.gear})</>
                                                  : gear.species
                                            }
                                        </SubValue><br/>
                                        <SubKey>Maillage</SubKey><SubValue>{gear.mesh ? <>{gear.mesh} mm</> : <NoValue>-</NoValue>}</SubValue>
                                        <SubKey>Dimensions</SubKey><SubValue>{gear.dimensions ? <>{gear.dimensions} m</> : <NoValue>-</NoValue>}</SubValue>
                                        <br/>
                                    </Gear>
                              })
                              : <NoValue>Pas d&apos;engins à bord</NoValue>}
                            <Fields>
                                <TableBody>
                                    <Field>
                                        <Key>Captures à bord</Key>
                                        <Value>{props.depMessage.speciesOnboard && props.depMessage.speciesOnboard.length
                                          ? props.depMessage.speciesOnboard.map(speciesCatch => {
                                            return <span key={speciesCatch.species}>
                                        {
                                            speciesCatch.speciesName
                                              ? <>{speciesCatch.speciesName} ({speciesCatch.species})</>
                                              : speciesCatch.species
                                        }
                                                    {''} - {speciesCatch.weight} kg<br/>
                                    </span>
                                          })
                                          : <NoValue>aucune</NoValue>}</Value>
                                    </Field>
                                </TableBody>
                            </Fields>
                        </Zone>
                    </ERSMessageContent>
            }
        </Wrapper>
    </>
}

const Gear = styled.div`
  margin-left: 5px;
  margin-top: ${props => props.isFirst ? '15px' : '5px'};
`

const SubKey = styled.span`
  font-size: 13px;
  color: ${COLORS.textGray};
  margin-right: 5px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin-right: 10px;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  margin-left: 10px;
  margin-right: 10px;
  text-align: left;
`

const Fields = styled.table`
  padding: 10px 5px 5px 5px; 
  width: inherit;
  display: table;
  margin: 0;
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
  color: ${COLORS.grayDarkerThree};
  line-height: normal;
`

const Gray = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-weight: 300;
`

const Wrapper = styled.li`
  margin: 0;
  background: ${COLORS.background};
  border-radius: 0;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  color: ${COLORS.textGray};
`

const ERSMessageContent = styled.div`
  width: inherit;
  height: 0;
  opacity: 0;
  overflow: hidden;
  padding: 0 0 0 20px;
  border-bottom: 1px solid ${COLORS.gray};
  animation: ${props => props.firstUpdate.current && !props.isOpen ? '' : props.isOpen ? `list-resume-${props.name}-${props.id}-opening` : `list-resume-${props.name}-${props.id}-closing`} 0.2s ease forwards;

  @keyframes ${props => props.name ? `list-resume-${props.name}-${props.id}-opening` : null} {
    0%   { height: 0; opacity: 0; }
    100% { height: ${props => props.speciesOnboard * 22 + props.gearOnboard * 50 + 30}px; opacity: 1; }
  }

  @keyframes ${props => props.name ? `list-resume-${props.name}-${props.id}-closing` : null} {
    0%   { opacity: 1; height: ${props => props.speciesOnboard * 22 + props.gearOnboard * 50 + 30}px; }
    100% { opacity: 0; height: 0; }
  }
`

export default DEPMessageResume
