import React, { useMemo } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ERSMessageType as ERSMessageTypeEnum } from '../../../domain/entities/ERS'
import { ReactComponent as XMLSVG } from '../../icons/Picto_XML.svg'
import { ReactComponent as AckOkSVG } from '../../icons/Message_JPE_acquitté.svg'
import { ReactComponent as AckNOkSVG } from '../../icons/Message_JPE_non_acquitté.svg'
import { getDateTime } from '../../../utils'

const ERSMessage = ({ message, isFirst }) => {
  const ersMessageHeaderTitle = useMemo(() => {
    if (message) {
      switch (message.messageType) {
        case ERSMessageTypeEnum.DEP.code.toString(): {
          return <>
            <ERSMessageName>{ERSMessageTypeEnum[message.messageType].name}</ERSMessageName>
            {message.message.departurePortName ? message.message.departurePortName : message.message.departurePort}
            {' '}le {getDateTime(message.message.departureDatetimeUtc, true)} <Gray>(UTC)</Gray></>
        }
        default: {
          return ERSMessageTypeEnum[message.messageType].fullName
        }
      }
    }
  }, [message])

  const openXML = xml => {
    const blob = new Blob([xml], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    window.open(url)
    URL.revokeObjectURL(url)
  }

  const getERSMessage = ersMessage => {
    const Component = ERSMessageTypeEnum[ersMessage.messageType].component
    return <Component message={ersMessage.message}/>
  }

  function getErsMessageType () {
    if (message.messageType === ERSMessageTypeEnum.DIS.code &&
      message.message.catches.some(aCatch => aCatch.presentation === ERSMessageTypeEnum.DIM.code)) {
      return ERSMessageTypeEnum.DIM.code
    }
    return message.messageType
  }

  return <>
    {message
      ? <Wrapper isFirst={isFirst}>
        <Header>
          <ERSMessageType>{getErsMessageType()}</ERSMessageType>
          <ERSMessageHeaderText
            isShortcut={message.isCorrected || message.deleted || message.referencedErsId}
            title={typeof ersMessageHeaderTitle === 'string' ? ersMessageHeaderTitle : ''}
            data-cy={'vessel-fishing-dep-message'}
          >
            {ersMessageHeaderTitle}
          </ERSMessageHeaderText>
          {
            message.isCorrected
              ? <CorrectedMessage>
                <MessageCorrected/>
                <CorrectedMessageText>ANCIEN MESSAGE</CorrectedMessageText>
              </CorrectedMessage>
              : null
          }
          {
            message.deleted
              ? <CorrectedMessage>
                <MessageCorrected/>
                <CorrectedMessageText>MESSAGE SUPPRIMÉ</CorrectedMessageText>
              </CorrectedMessage>
              : null
          }
          {
            message.referencedErsId
              ? <CorrectedMessage>
                <MessageOK/>
                <OKMessageText>MESSAGE CORRIGÉ</OKMessageText>
              </CorrectedMessage>
              : null
          }
          {
            message.rawMessage
              ? <XML
                title="Ouvrir le message XML brut"
                style={{ cursor: 'pointer' }}
                onClick={() => openXML(message.rawMessage)}/>
              : <XML/>
          }
        </Header>
        <Body>
          <ERSMessageMetadata>
            <EmissionDateTime>
              <Key>Date d&apos;émission</Key><br/>
              {getDateTime(message.operationDateTime, true)}
            </EmissionDateTime>
            <ReceptionDateTime>
              <Key>Date de réception</Key><br/>
              {getDateTime(message.operationDateTime, true)}
            </ReceptionDateTime>
            <VoyageNumber>
              <Key>N° de marée</Key><br/>
              {message.tripNumber ? message.tripNumber : <Gray>-</Gray>}
            </VoyageNumber>
            <Acknowledge>
              <Key>Acq.</Key><br/>
              {!message.acknowledge || message.acknowledge.isSuccess === null
                ? <Gray>-</Gray>
                : null}
              {message.acknowledge && message.acknowledge.isSuccess === true
                ? <AckOk/>
                : null}
              {message.acknowledge && message.acknowledge.isSuccess === false
                ? <AckNOk title={message.acknowledge.rejectionCause}/>
                : null}
            </Acknowledge>
          </ERSMessageMetadata>
          {getERSMessage(message)}
        </Body>
      </Wrapper>
      : null}
  </>
}

const OKMessageText = styled.span`
  vertical-align: text-top;
  line-height: 11px;
  margin: 0 3px 0 3px;
`

const CorrectedMessageText = styled.span`
  vertical-align: text-top;
  line-height: 11px;
  margin: 0 3px 0 3px;
`

const MessageCorrected = styled.span`
  height: 14px;
  margin-left: 3px;
  width: 14px;
  background-color: #E1000F;
  border-radius: 50%;
  display: inline-block;
`

const MessageOK = styled.span`
  height: 14px;
  margin-left: 3px;
  width: 14px;
  background-color: #8CC61F;
  border-radius: 50%;
  display: inline-block;
`

const CorrectedMessage = styled.span`
  border-radius: 11px;
  background: ${COLORS.gainsboro};
  font-size: 11px;
  color: ${COLORS.gunMetal};
  margin: 7px 7px 7px 3px;
  height: 17px;
  padding: 3px 5px 0px 2px;
`

const Gray = styled.span`
  color: ${COLORS.gainsboro};
  font-weight: 300;
`

const Key = styled.span`
  color: ${COLORS.slateGray};
`

const Acknowledge = styled.div`
  text-align: center;
  background: ${COLORS.background};
  padding: 5px 9px 9px 9px;
  margin-left: 10px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  flex-grow: 4;
`

const VoyageNumber = styled.div`
  text-align: center;
  background: ${COLORS.background};
  padding: 5px 9px 9px 9px;
  margin-left: 10px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  flex-grow: 3;
`

const ReceptionDateTime = styled.div`
  text-align: center;
  background: ${COLORS.background};
  padding: 5px 8px 9px 8px;
  margin-left: 10px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  flex-grow: 3;
`

const EmissionDateTime = styled.div`
  text-align: center;
  background: ${COLORS.background};
  padding: 5px 8px 9px 8px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  flex-grow: 3;
`

const ERSMessageMetadata = styled.div`
 display: flex;
`

const Body = styled.div`
  padding: 10px;
  background: ${COLORS.gainsboro};
`

const Wrapper = styled.div`
  margin-top: ${props => props.isFirst ? '5' : '10'}px;
  font-size: 13px;
  background: ${COLORS.background};
  text-align: left;
`

const Header = styled.div`
  height: 35px;
  width: inherit;
  padding: 0 0 0 10px;
  background: ${COLORS.charcoal};
  display: flex;
`

const ERSMessageHeaderText = styled.span`
  color: ${COLORS.background};
  font-weight: 500;
  margin: 5px 5px 5px 5px;
  padding: 3px 4px 2px 0;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  max-width: ${props => props.isShortcut ? '205px' : '370px'};
`

const ERSMessageName = styled.span`
  color: ${COLORS.gainsboro};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 0;
  font-size: 13px;
`

const ERSMessageType = styled.span`
  border: 2px solid ${COLORS.gainsboro};
  color: ${COLORS.gainsboro};
  margin: 5px 5px 5px 0;
  padding: 0 2px 1px 2px;
  font-size: 14px;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  width: 33px;
  display: inline-block;
  text-align: center;
  line-height: 19px;
`

const XML = styled(XMLSVG)`
  margin-left: auto;
  margin-top: 6.5px;
  margin-right: 10px;
  user-select: none;
  
  tspan {
    font-size: 9px;
  }
`

const AckNOk = styled(AckNOkSVG)`
  margin-top: 3px;
`

const AckOk = styled(AckOkSVG)`
  margin-top: 3px;
`

export default ERSMessage
