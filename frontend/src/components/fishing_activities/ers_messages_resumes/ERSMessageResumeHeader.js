import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ERSMessageType as ERSMessageTypeEnum } from '../../../domain/entities/ERS'
import { ReactComponent as ChevronIconSVG } from '../../icons/Chevron_simple_gris.svg'
import { ReactComponent as ArrowSVG } from '../../icons/Picto_fleche-pleine-droite.svg'
import { ReactComponent as NotAcknowledgedSVG } from '../../icons/Message_non_acquitte.svg'

const ERSMessageResumeHeader = props => {
  const firstUpdate = useRef(true)

  useEffect(() => {
    if (props.messageType && props.isOpen) {
      firstUpdate.current = false
    }
  }, [props.messageType])

  return <>
        { props.messageType
          ? <Wrapper>
                <ERSMessageTitle
                    onClick={() => props.setIsOpen(!props.isOpen)}
                    hasNoMessage={props.hasNoMessage}
                    isLastItem={props.isLastItem}>
                    {
                        props.hasNoMessage ? null : <ChevronIcon isOpen={props.isOpen} name={props.messageType}/>
                    }
                    <ERSMessageName
                      isNotAcknowledged={props.isNotAcknowledged}
                      hasNoMessage={props.hasNoMessage}
                      title={
                        props.rejectionCause
                          ? props.rejectionCause
                          : props.isDeleted
                            ? 'Message supprimé'
                            : ''
                      }>
                      {
                        props.isNotAcknowledged || props.isDeleted
                          ? <NotAcknowledgedOrDeleted />
                          : null
                      }
                        { ERSMessageTypeEnum[props.messageType].name }
                    </ERSMessageName>
                    <ERSMessageResumeText title={props.onHoverText ? props.onHoverText : ''}>
                        { props.hasNoMessage ? <Gray>Aucun message</Gray> : <>{props.title}{props.isAlert ? <Red /> : null}</> }
                    </ERSMessageResumeText>
                    {
                        props.hasNoMessage ? null : <ShowThisMessage onClick={() => props.showERSMessages(props.messageType)}/>
                    }
                </ERSMessageTitle>
            </Wrapper>
          : null }
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

const NotAcknowledgedOrDeleted = styled(NotAcknowledgedSVG)`
  width: 12px;
  vertical-align: text-bottom;
  margin-right: 5px;
  margin-bottom: 1px;
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
  vertical-align: -webkit-baseline-middle;
  max-width: 300px;
  display: inline-block;
  line-break: auto;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
`

const ERSMessageName = styled.span`
  color: ${props => props.isNotAcknowledged ? COLORS.red : COLORS.textGray};
  margin: 5px 0 5px ${props => props.hasNoMessage ? '27px' : '0px'};
  padding: 2px 4px 2px 4px;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  text-transform: uppercase;
`

const Wrapper = styled.div`
  margin: 0;
  background: ${COLORS.background};
  border-radius: 0;
  padding: 0;
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
  ${props => !props.isLastItem ? `border-bottom: 1px solid ${COLORS.gray};` : null}
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 17px;
  float: left;
  margin-right: 10px;
  margin-top: 12px;
  
  animation: ${props => props.isOpen ? `chevron-${props.name}-resume-opening` : `chevron-${props.name}-resume-closing`} 0.2s ease forwards;

  ${props => `
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
