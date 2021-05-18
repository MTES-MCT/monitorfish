import React, { useMemo } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ERSMessageType as ERSMessageTypeEnum } from '../../../domain/entities/ERS'
import { ReactComponent as XMLSVG } from '../../icons/Picto_XML.svg'
import { ReactComponent as AckOkSVG } from '../../icons/Message_JPE_acquitté.svg'
import { ReactComponent as AckNOkSVG } from '../../icons/Message_JPE_non_acquitté.svg'
import { getDateTime } from '../../../utils'

const ERSMessage = props => {
  const ersMessageHeaderTitle = useMemo(() => {
    if(props.message) {
      switch (props.message.messageType) {
        case ERSMessageTypeEnum.DEP.code.toString(): {
          return <>
            <ERSMessageName>{ERSMessageTypeEnum[props.message.messageType].name}</ERSMessageName>
            {props.message.message.departurePortName ? props.message.message.departurePortName : props.message.message.departurePort}
            {' '}le {getDateTime(props.message.message.departureDatetimeUtc, true)} <Gray>(UTC)</Gray></>
        }
        case ERSMessageTypeEnum.PNO.code.toString(): {
          return 'Préavis (notification de retour au port)'
        }
        case ERSMessageTypeEnum.FAR.code.toString(): {
          return 'Déclaration de capture'
        }
        case ERSMessageTypeEnum.COE.code.toString(): {
          return 'Entrée dans une zone d\'effort'
        }
        case ERSMessageTypeEnum.COX.code.toString(): {
          return 'Sortie d\'une zone d\'effort'
        }
        case ERSMessageTypeEnum.CRO.code.toString(): {
          return 'Traversée d\'une zone d\'effort'
        }
        case ERSMessageTypeEnum.DIS.code.toString(): {
          return 'Déclaration de rejets'
        }
        case ERSMessageTypeEnum.EOF.code.toString(): {
          return 'Fin de pêche'
        }
        case ERSMessageTypeEnum.RTP.code.toString(): {
          return 'Retour au port'
        }
        case ERSMessageTypeEnum.LAN.code.toString(): {
          return 'Débarquement'
        }
      }
    }
  }, [props.message])

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
    if (props.message.messageType === ERSMessageTypeEnum.DIS.code &&
            props.message.message.catches.some(aCatch => aCatch.presentation === ERSMessageTypeEnum.DIM.code)) {
      return ERSMessageTypeEnum.DIM.code
    }
    return props.message.messageType
  }

  return <>
        { props.message
          ? <Wrapper>
                <Header>
                    <ERSMessageType>{getErsMessageType()}</ERSMessageType>
                    <ERSMessageHeaderText
                      isShortcut={props.message.isCorrected || props.message.deleted || props.message.referencedErsId}
                      title={typeof ersMessageHeaderTitle === 'string' ? ersMessageHeaderTitle : ''}
                    >
                        {ersMessageHeaderTitle}
                    </ERSMessageHeaderText>
                    {
                        props.message.isCorrected
                          ? <CorrectedMessage>
                            <MessageCorrected/>
                            <CorrectedMessageText>ANCIEN MESSAGE</CorrectedMessageText>
                        </CorrectedMessage>
                          : null
                    }
                    {
                        props.message.deleted
                          ? <CorrectedMessage>
                            <MessageCorrected/>
                            <CorrectedMessageText>MESSAGE SUPPRIMÉ</CorrectedMessageText>
                        </CorrectedMessage>
                          : null
                    }
                    {
                        props.message.referencedErsId
                          ? <CorrectedMessage>
                            <MessageOK/>
                            <OKMessageText>MESSAGE CORRIGÉ</OKMessageText>
                        </CorrectedMessage>
                          : null
                    }
                    {
                        props.message.rawMessage
                          ? <XML
                            title="Ouvrir le message XML brut"
                            style={{ cursor: 'pointer' }}
                            onClick={() => openXML(props.message.rawMessage)}/>
                          : <XML/>
                    }
                </Header>
                <Body>
                    <ERSMessageMetadata>
                        <EmissionDateTime>
                            <Key>Date d&apos;émission</Key><br/>
                            {getDateTime(props.message.operationDateTime, true)}
                        </EmissionDateTime>
                        <ReceptionDateTime>
                            <Key>Date de réception</Key><br/>
                            {getDateTime(props.message.operationDateTime, true)}
                        </ReceptionDateTime>
                        <VoyageNumber>
                            <Key>N° de marée</Key><br/>
                            {props.message.tripNumber ? props.message.tripNumber : <Gray>-</Gray>}
                        </VoyageNumber>
                        <Acknowledge>
                            <Key>Acq.</Key><br/>
                            {!props.message.acknowledge || props.message.acknowledge.isSuccess === null
                              ? <Gray>-</Gray>
                              : null}
                            {props.message.acknowledge && props.message.acknowledge.isSuccess === true
                              ? <AckOk/>
                              : null}
                            {props.message.acknowledge && props.message.acknowledge.isSuccess === false
                              ? <AckNOk title={props.message.acknowledge.rejectionCause}/>
                              : null}
                        </Acknowledge>
                    </ERSMessageMetadata>
                    {getERSMessage(props.message)}
                </Body>
            </Wrapper>
          : null }
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
  background: ${COLORS.grayBackground};
  font-size: 11px;
  color: ${COLORS.grayDarkerThree};
  margin: 7px 7px 7px 3px;
  height: 17px;
  padding: 3px 5px 0px 2px;
`

const Gray = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-weight: 300;
`

const Key = styled.span`
  color: ${COLORS.textGray};
`

const Acknowledge = styled.div`
  text-align: center;
  background: ${COLORS.background};
  padding: 5px 9px 9px 9px;
  margin-left: 10px;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  flex-grow: 4;
`

const VoyageNumber = styled.div`
  text-align: center;
  background: ${COLORS.background};
  padding: 5px 9px 9px 9px;
  margin-left: 10px;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  flex-grow: 3;
`

const ReceptionDateTime = styled.div`
  text-align: center;
  background: ${COLORS.background};
  padding: 5px 8px 9px 8px;
  margin-left: 10px;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  flex-grow: 3;
`

const EmissionDateTime = styled.div`
  text-align: center;
  background: ${COLORS.background};
  padding: 5px 8px 9px 8px;
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  flex-grow: 3;
`

const ERSMessageMetadata = styled.div`
 display: flex;
`

const Body = styled.div`
  padding: 10px;
  background: ${COLORS.grayBackground};
`

const Wrapper = styled.div`
  margin-top: 10px;
  font-size: 13px;
  background: ${COLORS.background};
  text-align: left;
`

const Header = styled.div`
  height: 35px;
  width: inherit;
  padding: 0 0 0 10px;
  background: ${COLORS.grayDarkerThree};
  display: flex;
`

const ERSMessageHeaderText = styled.span`
  color: ${COLORS.grayBackground};
  margin: 5px 5px 5px 5px;
  padding: 3px 4px 2px 0;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  max-width: ${props => props.isShortcut ? '230px' : '370px'};
`

const ERSMessageName = styled.span`
  color: ${COLORS.grayBackground};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 0;
  font-size: 13px;
`

const ERSMessageType = styled.span`
  border: 1px solid ${COLORS.textGray};
  color: ${COLORS.grayBackground};
  margin: 5px 5px 5px 0;
  padding: 1px 2px 1px 2px;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  width: 31px;
  display: inline-block;
  text-align: center;
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
