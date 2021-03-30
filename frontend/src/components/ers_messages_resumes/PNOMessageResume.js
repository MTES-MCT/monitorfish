import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../../constants/constants";
import ERSMessageResumeHeader from "./ERSMessageResumeHeader";
import SpeciesAndWeightChart from "../SpeciesAndWeightChart";
import {getDateTime} from "../../utils";
import {ERSMessagePNOPurposeType, ERSMessageType as ERSMessageTypeEnum} from "../../domain/entities/ERS";

const PNOMessageResume = props => {
    const [isOpen, setIsOpen] = useState(false)
    const firstUpdate = useRef(true);
    const [chartHeight, setChartHeight] = useState(0)

    const [speciesAndWeightArray, setSpeciesAndWeightArray] = useState([])
    const [speciesNotLandedArray, setSpeciesNotLandedArray] = useState([])
    const [totalWeightNotLanded, setTotalWeightNotLanded] = useState(null)

    useEffect(() => {
        if(props.pnoMessage && props.speciesToWeightOfPNO && props.speciesToWeightOfFAR) {
            let pnoSpeciesAndWeight = Object.keys(props.speciesToWeightOfPNO)
                .map(speciesToWeightKey => props.speciesToWeightOfPNO[speciesToWeightKey])
                .sort((a, b) => a.weight < b.weight)
            setSpeciesAndWeightArray(pnoSpeciesAndWeight)

            let speciesNotLandedArray = Object.keys(props.speciesToWeightOfFAR)
                .map(speciesToWeightKey => props.speciesToWeightOfFAR[speciesToWeightKey])
                .filter(speciesToWeight => {
                    return !props.pnoMessage.message.catchOnboard
                        .some(landedSpecies => landedSpecies.species === speciesToWeight.species)
                })
                .sort((a, b) => a.weight < b.weight)
            setSpeciesNotLandedArray(speciesNotLandedArray)
            increaseHeight(speciesNotLandedArray.length ? speciesNotLandedArray.length * 18 : 0)

            setTotalWeightNotLanded(getTotalFARNotLandedWeight(speciesNotLandedArray))
        }
    }, [props.pnoMessage, props.speciesToWeightOfPNO, props.speciesToWeightOfFAR])

    useEffect(() => {
        if(isOpen) {
            firstUpdate.current = false
        }
    }, [isOpen])

    function getTotalFARNotLandedWeight(speciesNotLandedArray) {
        return speciesNotLandedArray.reduce((subAccumulator, speciesCatch) => {
            return subAccumulator + speciesCatch.weight
        }, 0)
    }

    const getPercentOfTotalWeight = (speciesAndWeightNotLanded, speciesAndWeightTotal) => {
        return parseFloat(((speciesAndWeightNotLanded * 100) / speciesAndWeightTotal).toFixed(1))
    }

    const getPNOMessageResumeTitleText = () => {
        return `${props.pnoMessage.message.portName ? props.pnoMessage.message.portName : props.pnoMessage.message.port}, prévu le ${getDateTime(props.pnoMessage.message.predictedArrivalDatetimeUtc, true)} (UTC)`
    }

    const getPNOMessageResumeTitle = () => {
        return <>{props.pnoMessage.message.portName ? props.pnoMessage.message.portName : props.pnoMessage.message.port}
            ,{' '} prévu le {getDateTime(props.pnoMessage.message.predictedArrivalDatetimeUtc, true)}  <Gray>(UTC)</Gray></>
    }

    const increaseHeight = height => {
        setChartHeight(chartHeight + height)
    }

    return <Wrapper>
        <ERSMessageResumeHeader
            id={props.id}
            onHoverText={props.hasNoMessage ? null : getPNOMessageResumeTitleText()}
            title={props.hasNoMessage ? null : getPNOMessageResumeTitle()}
            hasNoMessage={props.hasNoMessage}
            showERSMessages={props.showERSMessages}
            messageType={ERSMessageTypeEnum.PNO.code.toString()}
            setIsOpen={setIsOpen}
            isOpen={isOpen}/>
        {
            props.hasNoMessage ? null :
                <ERSMessageContent
                    chartHeight={chartHeight}
                    firstUpdate={firstUpdate}
                    isOpen={isOpen}
                    name={ERSMessageTypeEnum.PNO.code.toString()}>
                    <Zone>
                        <Fields>
                            <TableBody>
                                <Field>
                                    <Key>Date d'envoi</Key>
                                    <Value>{props.pnoMessage.operationDateTime ? <>Le {getDateTime(props.pnoMessage.operationDateTime, true)} <Gray>(UTC)</Gray></> : <NoValue>-</NoValue>}</Value>
                                </Field>
                                <Field>
                                    <Key>Port d'arrivée</Key>
                                    <Value>{props.pnoMessage.message.port && props.pnoMessage.message.portName ? <>{props.pnoMessage.message.portName} ({props.pnoMessage.message.port})</> : <NoValue>-</NoValue>}</Value>
                                </Field>
                                <Field>
                                    <Key>Raison du préavis</Key>
                                    <Value>{props.pnoMessage.message.purpose ? <>{ERSMessagePNOPurposeType[props.pnoMessage.message.purpose]} ({props.pnoMessage.message.purpose})</> : <NoValue>-</NoValue>}</Value>
                                </Field>
                            </TableBody>
                        </Fields>
                        <SpeciesAndWeightChart
                            increaseChartHeight={increaseHeight}
                            compareWithTotalWeight={true}
                            speciesAndWeightArray={speciesAndWeightArray}
                        />
                        {
                            speciesNotLandedArray && speciesNotLandedArray.length ?
                                <SpeciesNotLanded>
                                    Poids des captures non débarquées ({getPercentOfTotalWeight(totalWeightNotLanded, props.totalFARAndDEPWeight)}%)
                                    {speciesNotLandedArray && speciesNotLandedArray.length ?
                                        speciesNotLandedArray.map(speciesCatch => {
                                            return <IndividualSpeciesNotLanded key={speciesCatch.species}>
                                                {
                                                    speciesCatch.speciesName ?
                                                        <>{speciesCatch.speciesName} ({speciesCatch.species})</> : speciesCatch.species
                                                }
                                                {''} - {speciesCatch.weight} kg<br/>
                                            </IndividualSpeciesNotLanded>
                                        }) : <NoValue>-</NoValue>}
                                </SpeciesNotLanded> : null
                        }
                    </Zone>
                </ERSMessageContent>
        }
    </Wrapper>
}

const IndividualSpeciesNotLanded = styled.div`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  height: 18px;
`

const SpeciesNotLanded = styled.div`
  background: ${COLORS.grayBackground};
  padding: 10px 15px 10px 15px;
  width: max-content;
  margin: 10px 5px 5px 5px;
  font-size: 13px;
`

const Gray = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-weight: 300;
`

const TableBody = styled.tbody``

const Fields = styled.table`
  padding: 5px 5px 5px 5px; 
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
  color: ${COLORS.grayDarkerTwo};
  font-weight: 300;
  line-height: normal;
`

const Zone = styled.div`
  margin: 0 10px 10px 10px;
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
    100% { height: ${props => props.chartHeight + 160}px; opacity: 1; }
  }

  @keyframes ${props => props.name ? `list-resume-${props.name}-${props.id}-closing` : null} {
    0%   { opacity: 1; height: ${props => props.chartHeight + 160}px; }
    100% { opacity: 0; height: 0; }
  }
`

export default PNOMessageResume
