import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../../../constants/constants";
import ERSMessageResumeHeader from "./ERSMessageResumeHeader";
import {getDateTime} from "../../../utils";
import {ERSMessageType as ERSMessageTypeEnum} from "../../../domain/entities/ERS";
import {AlertTypes} from "../../../domain/entities/alerts";

const LANMessageResume = props => {
    const [isOpen, setIsOpen] = useState(false)
    const firstUpdate = useRef(true);
    const [chartHeight, setChartHeight] = useState(0)

    useEffect(() => {
        if(props.lanMessage) {
            let height = props.lanMessage.catchLanded.length > 0 ? props.lanMessage.catchLanded.length * 58 : 0
            increaseHeight(height)
        }
    }, [props.lanMessage])

    const getPortName = message => {
        if (message.portName && message.port) {
            return <>{message.portName} ({message.port})</>
        } else if(message.port) {
            return <>{message.port}</>
        }

        return <NoValue>-</NoValue>
    }

    useEffect(() => {
        if(isOpen) {
            firstUpdate.current = false
        }
    }, [isOpen])

    const increaseHeight = height => {
        setChartHeight(chartHeight + height)
    }

    const getWeightOverToleranceInfo = () => {
        if (props.catchesOverToleranceAlert) {
            return AlertTypes.PNO_LAN_WEIGHT_TOLERANCE_ALERT.nameWithAlertDetails(
                props.catchesOverToleranceAlert.percentOfTolerance,
                props.catchesOverToleranceAlert.minimumWeightThreshold)
        }

        return ""
    }

    return <Wrapper>
        <ERSMessageResumeHeader
            isAlert={!!props.catchesOverToleranceAlert}
            title={props.hasNoMessage ? null : props.catchesOverToleranceAlert ? AlertTypes.PNO_LAN_WEIGHT_TOLERANCE_ALERT.name : null}
            onHoverText={getWeightOverToleranceInfo()}
            hasNoMessage={props.hasNoMessage}
            showERSMessages={props.showERSMessages}
            messageType={ERSMessageTypeEnum.LAN.code.toString()}
            setIsOpen={setIsOpen}
            isOpen={isOpen}
            isLastItem={true}
        />
        {
            props.hasNoMessage ? null :
                <ERSMessageContent
                    id={props.id}
                    chartHeight={chartHeight}
                    firstUpdate={firstUpdate}
                    isOpen={isOpen}
                    name={ERSMessageTypeEnum.LAN.code.toString()}>
                    <Zone>
                        <Fields withoutMarginBottom={true}>
                            <TableBody>
                                <Field>
                                    <Key>Date de fin de débarquement</Key>
                                    <Value>{ props.lanMessage.landingDatetimeUtc ? getDateTime(props.lanMessage.landingDatetimeUtc, true) : <NoValue>-</NoValue>}</Value>
                                </Field>
                                <Field>
                                    <Key>Port de débarquement</Key>
                                    <Value>{ getPortName(props.lanMessage) }</Value>
                                </Field>
                            </TableBody>
                        </Fields>
                        <Fields withoutMarginTop={true} withoutMarginBottom={true}>
                            <TableBody>
                                <Field>
                                    <Key>Poids débarqué</Key>
                                    <Value>
                                        {props.totalLANWeight ? props.totalLANWeight : <NoValue>-</NoValue>} kg
                                        {
                                            props.totalPNOWeight ? <> sur les {props.totalPNOWeight} kg annoncés dans le PNO</> : null
                                        }
                                    </Value>
                                </Field>
                            </TableBody>
                        </Fields>
                        {props.lanMessage.catchLanded && props.lanMessage.catchLanded.length ?
                            props.lanMessage.catchLanded.map((speciesCatch, index) => {
                                return <Species key={index}>
                                    <SubKey>Espèce {index + 1}</SubKey>{' '}
                                    <SubValue>
                                        {
                                            speciesCatch.speciesName ?
                                                <>{speciesCatch.speciesName} ({speciesCatch.species})</> : speciesCatch.species
                                        }
                                        {
                                            props.catchesOverToleranceAlert && props.catchesOverToleranceAlert.catchesOverTolerance && props.catchesOverToleranceAlert.catchesOverTolerance.length ?
                                                props.catchesOverToleranceAlert.catchesOverTolerance.some(catchWithAlert => catchWithAlert.lan.species === speciesCatch.species) ? <OverWeightTolerance title={getWeightOverToleranceInfo()}>
                                                    <OverWeightToleranceText>10 %</OverWeightToleranceText>
                                                </OverWeightTolerance> : null
                                                : null
                                        }
                                    </SubValue><br/>
                                    <Weights>
                                        <Weight>
                                            <SubKey>Poids FAR</SubKey>
                                            <SubValueWeight withPNOWeight={props.speciesToWeightOfPNO && props.speciesToWeightOfPNO[speciesCatch.species]}>{props.speciesToWeightOfFAR && props.speciesToWeightOfFAR[speciesCatch.species]
                                              ? <span title={`${props.speciesToWeightOfFAR[speciesCatch.species].weight} kg`}>{props.speciesToWeightOfFAR[speciesCatch.species].weight} kg</span>
                                              : <NoValue>-</NoValue>}
                                            </SubValueWeight>
                                        </Weight>
                                        {
                                            props.speciesToWeightOfPNO && props.speciesToWeightOfPNO[speciesCatch.species]
                                              ? <Weight>
                                                  <SubKey>Poids PNO</SubKey>
                                                  <SubValueWeight>
                                                      <span title={`${props.speciesToWeightOfPNO[speciesCatch.species].weight} kg`}>{props.speciesToWeightOfPNO[speciesCatch.species].weight} kg</span>
                                                  </SubValueWeight>
                                              </Weight>
                                              : null
                                        }
                                        <Weight>
                                            <SubKey>Poids LAN</SubKey>
                                            <SubValueWeight withPNOWeight={props.speciesToWeightOfPNO && props.speciesToWeightOfPNO[speciesCatch.species]}>{props.speciesToWeightOfLAN && props.speciesToWeightOfLAN[speciesCatch.species]
                                              ? <span title={`${props.speciesToWeightOfLAN[speciesCatch.species].weight} kg`}>{props.speciesToWeightOfLAN[speciesCatch.species].weight} kg</span>
                                              : <NoValue>-</NoValue>}
                                            </SubValueWeight>
                                        </Weight>
                                    </Weights>
                                </Species>
                            }) : <Gray>Aucune capture à bord</Gray>}
                    </Zone>
                </ERSMessageContent>
        }
    </Wrapper>
}

const OverWeightToleranceText = styled.span`
  vertical-align: text-top;
  line-height: 9px;
  margin: 0 0 0 3px;
`

const OverWeightTolerance = styled.span`
  border-radius: 11px;
  background: #E1000F;
  font-size: 11px;
  color: ${COLORS.background};
  margin: 7px 7px 7px 5px;
  height: 17px;
  padding: 3px 5px 0px 2px;
`

const Weights = styled.div`
  display: flex;
`

const Weight = styled.div`
  flex: 1 1 0;
`

const Gray = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-weight: 300;
  font-size: 13px;
  text-align: center;
  width: -moz-available;
  width: -webkit-fill-available;
`

const Species = styled.div`
  margin-top: 10px;
  margin-left: 5px;
  width: -moz-available;
  width: -webkit-fill-available;
`

const SubKey = styled.span`
  font-size: 13px;
  color: ${COLORS.textGray};
  margin-right: 10px;
`

const SubValue = styled.span`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin-right: 10px;
`

const SubValueWeight = styled.span`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin-right: 10px;
  max-width: ${props => props.withPNOWeight ? '50' : '90'}px;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  display: inline-block;
  vertical-align: bottom;
`

const TableBody = styled.tbody``

const Fields = styled.table`
  padding: 0px 5px ${props => props.withoutMarginBottom ? '0' : '5px'} 5px; 
  width: inherit;
  display: table;
  margin: 0;
  line-height: 0.2em;
  margin-top: ${props => props.withoutMarginTop ? '0' : '5px'};
  margin-bottom: ${props => props.withoutMarginBottom ? '0' : '5px'};
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

const Zone = styled.div`
  margin: 10px 10px 10px 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
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
    100% { height: ${props => props.chartHeight + 120}px; opacity: 1; }
  }

  @keyframes ${props => props.name ? `list-resume-${props.name}-${props.id}-closing` : null} {
    0%   { opacity: 1; height: ${props => props.chartHeight + 120}px; }
    100% { opacity: 0; height: 0; }
  }
`

export default LANMessageResume
