import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../../constants/constants";
import ERSMessageResumeHeader from "./ERSMessageResumeHeader";
import SpeciesAndWeightChart from "../SpeciesAndWeightChart";
import {ERSMessageType as ERSMessageTypeEnum} from "../../domain/entities/ERS";

const FARMessageResume = props => {
    const [isOpen, setIsOpen] = useState(false)
    const firstUpdate = useRef(true);
    const [speciesAndWeightArray, setSpeciesAndWeightArray] = useState([])
    const [chartHeight, setChartHeight] = useState(0)

    useEffect(() => {
        if(props.speciesToWeightOfFAR) {
            let array = Object.keys(props.speciesToWeightOfFAR)
                .map(species => props.speciesToWeightOfFAR[species])
                .sort((a, b) => a.weight < b.weight)
            setSpeciesAndWeightArray(array)
        }
    }, [props.speciesToWeightOfFAR])

    useEffect(() => {
        if(isOpen) {
            firstUpdate.current = false
        }
    }, [isOpen])

    const getFARMessageResumeTitleText = () =>
        `${props.numberOfMessages} message${props.numberOfMessages > 1 ? 's' : ''} - ${props.totalFARWeight} kg pêchés au total`

    const getFARMessageResumeTitle = () => {
        return <>{props.numberOfMessages} message{props.numberOfMessages > 1 ? 's' : ''} - {props.totalFARWeight} kg pêchés au total</>
    }

    const increaseChartHeight = height => {
        setChartHeight(chartHeight + height)
    }

    return <Wrapper>
        <ERSMessageResumeHeader
            onHoverText={props.hasNoMessage ? null : getFARMessageResumeTitleText()}
            title={props.hasNoMessage ? null : getFARMessageResumeTitle()}
            hasNoMessage={props.hasNoMessage}
            showERSMessages={props.showERSMessages}
            messageType={ERSMessageTypeEnum.FAR.code.toString()}
            setIsOpen={setIsOpen}
            isOpen={isOpen}/>
        {
            props.hasNoMessage ? null :
                <ERSMessageContent
                    chartHeight={chartHeight}
                    species={(speciesAndWeightArray && speciesAndWeightArray.length > 0) ? speciesAndWeightArray.length : 1}
                    firstUpdate={firstUpdate}
                    isOpen={isOpen}
                    name={ERSMessageTypeEnum.FAR.code.toString()}>
                    <Zone>
                        <SpeciesAndWeightChart
                            increaseChartHeight={increaseChartHeight}
                            compareWithTotalWeight={true}
                            speciesAndWeightArray={speciesAndWeightArray}
                        />
                    </Zone>
                </ERSMessageContent>
        }
    </Wrapper>
}

const Zone = styled.div`
  margin: 10px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
`

const Wrapper = styled.li`
  margin: 0;
  background: ${COLORS.background};
  border-radius: 0;
  padding: 0;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  color: ${COLORS.textGray};
`

const ERSMessageContent = styled.div`
  width: inherit;
  height: 0;
  opacity: 0;
  overflow: hidden;
  padding-left: 20px;
  border-bottom: 1px solid ${COLORS.gray};
  animation: ${props => props.firstUpdate.current && !props.isOpen ? '' : props.isOpen ? `list-resume-${props.name}-opening` : `list-resume-${props.name}-closing`} 0.2s ease forwards;

  @keyframes ${props => props.name ? `list-resume-${props.name}-opening` : null} {
    0%   { height: 0; opacity: 0; }
    100% { height: ${props => props.chartHeight + 20}px; opacity: 1; }
  }

  @keyframes ${props => props.name ? `list-resume-${props.name}-closing` : null} {
    0%   { opacity: 1; height: ${props => props.chartHeight + 20}px; }
    100% { opacity: 0; height: 0; }
  }
`

export default FARMessageResume
