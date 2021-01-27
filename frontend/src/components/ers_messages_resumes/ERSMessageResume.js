import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../../constants/constants";
import {ERSMessageType as ERSMessageTypeEnum} from "../../domain/entities/ERS";
import {getDateTime} from "../../utils";
import {ReactComponent as ChevronIconSVG} from '../icons/Chevron_simple_gris.svg'
import DEPMessageResume from "./DEPMessageResume";
import FARMessageResume from "./FARMessageResume";
import PNOMessageResume from "./PNOMessageResume";
import DISMessageResume from "./DISMessageResume";

const FIRST_MESSAGE = 0

const ERSMessageResume = props => {
    const [isOpen, setIsOpen] = useState(false)
    const firstUpdate = useRef(true);

    useEffect(() => {
        if(props.ersMessages && isOpen) {
            firstUpdate.current = false
        }
    }, [props.ersMessages])

    function getTotalWeightFromMessages(ersMessages) {
        return ersMessages.reduce((accumulator, ersMessage) => {
            let sumOfCatches = ersMessage.message.catches.reduce((subAccumulator, speciesCatch) => {
                return subAccumulator + speciesCatch.weight
            }, 0)

            return accumulator + sumOfCatches
        }, 0);
    }

    const getERSMessageResumeTitle = ersMessages => {
        switch (ersMessages[FIRST_MESSAGE].messageType) {
            case ERSMessageTypeEnum.DEP.code.toString(): {
                return <>{ersMessages[FIRST_MESSAGE].message.departurePortName ? ersMessages[FIRST_MESSAGE].message.departurePortName : ersMessages[FIRST_MESSAGE].message.departurePort}
                    {' '}le {getDateTime(ersMessages[FIRST_MESSAGE].message.departureDatetimeUtc, true)} <Gray>(UTC)</Gray></>
            }
            case ERSMessageTypeEnum.PNO.code.toString(): {
                return <>{ersMessages[FIRST_MESSAGE].message.portName ? ersMessages[FIRST_MESSAGE].message.portName : ersMessages[FIRST_MESSAGE].message.port}
                    {' '}le {getDateTime(ersMessages[FIRST_MESSAGE].message.predictedArrivalDatetimeUtc, true)}  <Gray>(UTC)</Gray></>
            }
            case ERSMessageTypeEnum.FAR.code.toString(): {
                let totalWeight = getTotalWeightFromMessages(ersMessages)

                return <>{ersMessages.length} message{ersMessages.length > 1 ? 's' : ''} - {totalWeight} kg pêchés au total</>
            }
            case ERSMessageTypeEnum.DIS.code.toString(): {
                let totalWeight = getTotalWeightFromMessages(ersMessages)

                return <>{ersMessages.length} message{ersMessages.length > 1 ? 's' : ''} - {totalWeight} kg rejetés au total</>
            }
        }
    }

    const getERSMessageResume = ersMessages => {
        switch (ersMessages[FIRST_MESSAGE].messageType) {
            case ERSMessageTypeEnum.DEP.code: {
                return <DEPMessageResume message={ersMessages[FIRST_MESSAGE].message} />
            }
            case ERSMessageTypeEnum.FAR.code: {
                return <FARMessageResume messages={ersMessages}/>
            }
            case ERSMessageTypeEnum.DIS.code: {
                return <DISMessageResume messages={ersMessages}/>
            }
            case ERSMessageTypeEnum.PNO.code: {
                return <PNOMessageResume
                    ersMessage={ersMessages[FIRST_MESSAGE]}
                    farMessages={ersMessages
                        .filter(ersMessage => ersMessage.messageType !== ERSMessageTypeEnum.PNO.code)}
                />
            }
        }
    }

    return <>
        { props.ersMessages ?
            <Wrapper>
                <ERSMessageTitle onClick={() => setIsOpen(!isOpen)}>
                    <ERSMessageType>{props.ersMessages[FIRST_MESSAGE].messageType}</ERSMessageType>
                    <ERSMessageName>{ERSMessageTypeEnum[props.ersMessages[FIRST_MESSAGE].messageType].name}</ERSMessageName>
                    <ERSMessageResumeText>
                        {getERSMessageResumeTitle(props.ersMessages)}
                    </ERSMessageResumeText>
                    <ChevronIcon isOpen={isOpen} name={props.ersMessages[FIRST_MESSAGE].ersId}/>
                </ERSMessageTitle>
                <ERSMessageContent firstUpdate={firstUpdate} isOpen={isOpen} name={props.ersMessages[FIRST_MESSAGE].ersId}>
                    {getERSMessageResume(props.ersMessages)}
                </ERSMessageContent>
            </Wrapper> : null }
    </>
}

const Gray = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-weight: 300;
`

const ERSMessageResumeText = styled.span`
  color: ${COLORS.grayDarkerThree};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 0;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
`


const ERSMessageName = styled.span`
  color: ${COLORS.textGray};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 4px;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
`

const ERSMessageType = styled.span`
  border: 1px solid ${COLORS.textGray};
  color: ${COLORS.textGray};
  margin: 5px 5px 5px 0;
  padding: 1px 2px 1px 2px;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  width: 31px;
  display: inline-block;
  text-align: center;
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

const ERSMessageTitle = styled.div`
  height: 35px;
  width: inherit;
  padding: 0 0 0 20px;
  user-select: none;
  cursor: pointer;
  border-bottom: 1px solid ${COLORS.gray};
`

const ERSMessageContent = styled.div`
  width: inherit;
  height: 0;
  opacity: 0;
  overflow: hidden;
  padding: 0 0 0 20px;
  border-bottom: 1px solid ${COLORS.gray};
  animation: ${props =>  props.firstUpdate && !props.isOpen  ? '' : props.isOpen ? `list-zones-${props.name}-opening` : `list-zones-${props.name}-closing`} 0.2s ease forwards;

  @keyframes ${props => props.name ? `list-zones-${props.name}-opening` : null} {
    0%   { height: 0; opacity: 0; }
    100% { height: auto; opacity: 1; }
  }

  @keyframes ${props => props.name ? `list-zones-${props.name}-closing` : null} {
    0%   { opacity: 1; height: auto; }
    100% { opacity: 0; height: 0; }
  }
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 12px;
  
  animation: ${props => props.isOpen ? `chevron-${props.name}-zones-opening` : `chevron-${props.name}-zones-closing`} 0.5s ease forwards;


  ${ props => `
      @keyframes chevron-${props.name}-zones-opening {
        0%   { transform: rotate(180deg); }
        100% { transform: rotate(0deg); }
      }
    
      @keyframes chevron-${props.name}-closing {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(180deg);   }
      }
      `
    }
`

export default ERSMessageResume
