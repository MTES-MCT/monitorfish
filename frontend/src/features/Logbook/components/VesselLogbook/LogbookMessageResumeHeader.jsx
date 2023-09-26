import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import ChevronIconSVG from '../../../icons/Chevron_simple_gris.svg?react'
import ArrowSVG from '../../../icons/Picto_fleche-pleine-droite.svg?react'
import NotAcknowledgedSVG from '../../../icons/Message_non_acquitte.svg?react'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../constants'

const LogbookMessageResumeHeader = props => {
  const firstUpdate = useRef(true)

  useEffect(() => {
    if (props.messageType && props.isOpen) {
      firstUpdate.current = false
    }
  }, [props.messageType])

  return <>
    {props.messageType
      ? <Wrapper>
        <LogbookMessageTitle
          onClick={() => props.setIsOpen(!props.isOpen)}
          hasNoMessage={props.hasNoMessage || props.noContent}
          isLastItem={props.isLastItem}
          isOpen={props.isOpen}
        >
          {
            props.hasNoMessage || props.noContent ? null : <ChevronIcon $isOpen={props.isOpen} name={props.messageType}/>
          }
          <LogbookMessageName
            isNotAcknowledged={props.isNotAcknowledged}
            hasNoMessage={props.hasNoMessage || props.noContent}
            title={
              props.rejectionCause
                ? props.rejectionCause
                : props.isDeleted
                  ? 'Message supprimé'
                  : ''
            }>
            {
              props.isNotAcknowledged || props.isDeleted
                ? <NotAcknowledgedOrDeleted data-cy={'fishing-resume-not-acknowledged-icon'}/>
                : null
            }
            {LogbookMessageTypeEnum[props.messageType].name}
          </LogbookMessageName>
          <LogbookMessageResumeText
            data-cy={'vessel-fishing-resume-title'}
            title={props.onHoverText ? props.onHoverText : ''}>
            {props.hasNoMessage ? <Gray>Aucun message</Gray> : <>{props.title}{props.isAlert ? <Red/> : null}</>}
          </LogbookMessageResumeText>
          {
            props.hasNoMessage ? null : <ShowThisMessage onClick={() => props.showLogbookMessages(props.messageType)}/>
          }
        </LogbookMessageTitle>
      </Wrapper>
      : null}
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
  color: ${COLORS.gunMetal};
  font-weight: 300;
`

const LogbookMessageResumeText = styled.span`
  color: ${COLORS.gunMetal};
  margin: 5px 5px 5px 5px;
  padding: 2px 4px 2px 0;
  font-size: 13px;
  font-weight: 500;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  max-width: 290px;
  display: inline-block;
  line-break: auto;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
`

const LogbookMessageName = styled.span`
  color: ${props => props.isNotAcknowledged ? COLORS.maximumRed : COLORS.slateGray};
  font-weight: 500;
  margin: 5px 0 5px ${props => props.hasNoMessage ? '27px' : '0px'};
  padding: 2px 4px 2px 4px;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  text-transform: uppercase;
`

const Wrapper = styled.div`
  margin: 0;
  background: ${p => p.theme.color.white};
  border-radius: 0;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  color: ${COLORS.slateGray};
`

const LogbookMessageTitle = styled.div`
  height: 35px;
  width: inherit;
  padding: 0 0 0 20px;
  user-select: none;
  ${props => !props.hasNoMessage ? 'cursor: pointer;' : null}}
  ${props => !props.isLastItem || props.isOpen ? `border-bottom: 1px solid ${props.theme.color.lightGray};` : null}
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 17px;
  float: left;
  margin-right: 10px;
  margin-top: 12px;

  animation: ${props => props.$isOpen ? `chevron-${props.name}-resume-opening` : `chevron-${props.name}-resume-closing`} 0.2s ease forwards;

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

export default LogbookMessageResumeHeader
