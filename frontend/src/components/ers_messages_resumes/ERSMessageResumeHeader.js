import React, {useEffect, useRef} from "react";
import styled from "styled-components";
import {COLORS} from "../../constants/constants";
import {ERSMessageType as ERSMessageTypeEnum} from "../../domain/entities/ERS";
import {ReactComponent as ChevronIconSVG} from '../icons/Chevron_simple_gris.svg'
import {ReactComponent as ArrowSVG} from './../icons/Picto_fleche-pleine-droite.svg'

const ERSMessageResumeHeader = props => {
    const firstUpdate = useRef(true);

    useEffect(() => {
        if(props.messageType && props.isOpen) {
            firstUpdate.current = false
        }
    }, [props.messageType])

    return <>
        { props.messageType ?
            <Wrapper>
                <ERSMessageTitle onClick={() => props.setIsOpen(!props.isOpen)} hasNoMessage={props.hasNoMessage}>
                    {
                        props.hasNoMessage ? null : <ChevronIcon isOpen={props.isOpen} name={props.messageType}/>
                    }
                    <ERSMessageName hasNoMessage={props.hasNoMessage}>
                        { ERSMessageTypeEnum[props.messageType].name }
                    </ERSMessageName>
                    <ERSMessageResumeText title={props.onHoverText}>
                        { props.hasNoMessage ? <Gray>Aucun message</Gray> : <>{props.title}{props.isAlert ? <Red /> : null}</> }
                    </ERSMessageResumeText>
                    {
                        props.hasNoMessage ? null : <ShowThisMessage onClick={() => props.showERSMessages(props.messageType)}/>
                    }
                </ERSMessageTitle>
            </Wrapper> : null }
    </>
}

const Red = styled.span`
  height: 8px;
  width: 8px;
  margin-left: 5px;
  background-color: #E1000F;
  border-radius: 50%;
  display: inline-block;
`

const ShowThisMessage = styled(ArrowSVG)`
  vertical-align: sub;
  float: right;
  padding: 11px 10px 10px 21px;
  cursor: pointer;
`

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
  margin: 5px 5px 5px ${props => props.hasNoMessage ? '27px': '0px'};
  padding: 2px 4px 2px 4px;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  text-transform: uppercase;
`

const Wrapper = styled.div`
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
  ${props => !props.hasNoMessage ? 'cursor: pointer;' : null}}
  border-bottom: 1px solid ${COLORS.gray};
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 17px;
  float: left;
  margin-right: 10px;
  margin-top: 12px;
  
  animation: ${props => props.isOpen ? `chevron-${props.name}-resume-opening` : `chevron-${props.name}-resume-closing`} 0.2s ease forwards;

  ${ props => `
      @keyframes chevron-${props.name}-resume-opening {
        0%   { transform: rotate(180deg); }
        100% { transform: rotate(0deg); }
      }
    
      @keyframes chevron-${props.name}-resume-closing {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(180deg);   }
      }
      `
    }
`

export default ERSMessageResumeHeader
