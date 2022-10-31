import React, { useMemo } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import {
  getLogbookMessageType,
  LogbookMessageType as LogbookMessageTypeEnum
} from '../../../../domain/entities/logbook'
import { ReactComponent as XMLSVG } from '../../../icons/Picto_XML.svg'
import { ReactComponent as AckOkSVG } from '../../../icons/Message_JPE_acquitté.svg'
import { ReactComponent as AckNOkSVG } from '../../../icons/Icon_not_OK.svg'
import { ReactComponent as ShowActivitySVG } from '../../../icons/Position_message_JPE_Pin_gris_clair.svg'
import { ReactComponent as HideActivitySVG } from '../../../icons/Position_message_JPE_Pin_masquer.svg'
import { getDateTime } from '../../../../utils'
import { useDispatch, useSelector } from 'react-redux'
import { removeFishingActivityFromMap, showFishingActivityOnMap } from '../../../../domain/shared_slices/FishingActivities'

const LogbookMessage = ({ message, isFirst }) => {
  const dispatch = useDispatch()
  const {
    /** @type {FishingActivityShowedOnMap[]} fishingActivitiesShowedOnMap */
    fishingActivitiesShowedOnMap
  } = useSelector(state => state.fishingActivities)

  const logbookHeaderTitle = useMemo(() => {
    if (message) {
      switch (message.messageType) {
        case LogbookMessageTypeEnum.DEP.code.toString(): {
          return <>
            <LogbookMessageName>{LogbookMessageTypeEnum[message.messageType].name}</LogbookMessageName>
            {message.message.departurePortName ? message.message.departurePortName : message.message.departurePort}
            {' '}le {getDateTime(message.message.departureDatetimeUtc, true)} <Gray>(UTC)</Gray></>
        }
        default: {
          return LogbookMessageTypeEnum[message.messageType].fullName
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

  const getLogbookMessage = logbook => {
    const Component = LogbookMessageTypeEnum[logbook.messageType].component

    if (Component) {
      return <Component message={logbook.message}/>
    } else {
      return null
    }
  }

  return <>
    {message
      ? <Wrapper isFirst={isFirst} id={message.operationNumber}>
        <Header>
          <LogbookMessageType>{getLogbookMessageType(message)}</LogbookMessageType>
          <LogbookMessageHeaderText
            isShortcut={message.isCorrected || message.deleted || message.referencedReportId}
            title={typeof logbookHeaderTitle === 'string' ? logbookHeaderTitle : ''}
            data-cy={'vessel-fishing-message'}
          >
            {logbookHeaderTitle}
          </LogbookMessageHeaderText>
          {
            message.isCorrected
              ? <CorrectedMessage>
                <MessageCorrected/>
                <MessageText>ANCIEN MESSAGE</MessageText>
              </CorrectedMessage>
              : null
          }
          {
            message.deleted
              ? <CorrectedMessage>
                <MessageCorrected/>
                <MessageText>MESSAGE SUPPRIMÉ</MessageText>
              </CorrectedMessage>
              : null
          }
          {
            message.referencedReportId
              ? <CorrectedMessage>
                <MessageOK/>
                <MessageText>MESSAGE CORRIGÉ</MessageText>
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
          {
            !message.isCorrected
              ? fishingActivitiesShowedOnMap.find(showed => showed.id === message.operationNumber)
                ? <HideActivity
                  data-cy={'hide-fishing-activity'}
                  title={'Cacher le message sur la piste'}
                  onClick={() => dispatch(removeFishingActivityFromMap(message.operationNumber))}
                />
                : <ShowActivity
                  data-cy={'show-fishing-activity'}
                  title={'Afficher le message sur la piste'}
                  onClick={() => dispatch(showFishingActivityOnMap(message.operationNumber))}
                />
              : null
          }
        </Header>
        <Body data-cy={'vessel-fishing-message-body'}>
          {
            message.isSentByFailoverSoftware
              ? <SoftwareFailover>
              <MessageSentByFailoverSoftwareIcon/>
                Message envoyé via e-sacapt
              </SoftwareFailover>
              : null
          }
          <LogbookMessageMetadata>
            <EmissionDateTime>
              <Key>Date de saisie</Key><br/>
              {getDateTime(message.reportDateTime, true)}
            </EmissionDateTime>
            <ReceptionDateTime>
              <Key>Date de réception</Key><br/>
              {getDateTime(message.integrationDateTime, true)}
            </ReceptionDateTime>
            <VoyageNumber title={message.tripNumber}>
              <Key>N° de marée</Key><br/>
              {message.tripNumber ? message.tripNumber : <Gray>-</Gray>}
            </VoyageNumber>
            <Acknowledge>
              <Key>Acq.</Key><br/>
              {!message.acknowledge || message.acknowledge.isSuccess === null
                ? <Gray>-</Gray>
                : null}
              {message.acknowledge?.isSuccess === true
                ? <AckOk/>
                : null}
              {message.acknowledge?.isSuccess === false
                ? <AckNOk title={message.acknowledge.rejectionCause}/>
                : null}
            </Acknowledge>
          </LogbookMessageMetadata>
          {getLogbookMessage(message)}
        </Body>
      </Wrapper>
      : null}
  </>
}

const SoftwareFailover = styled.div`
  padding: 9px 10px 9px 10px;
  margin-bottom: 10px;
  text-align: center;
  color: ${COLORS.white};
  font-size: 13px;
  background: ${COLORS.slateGray};
`

const MessageSentByFailoverSoftwareIcon = styled.span`
  height: 10px;
  margin-right: 6px;
  width: 10px;
  background-color: ${p => p.theme.color.goldenPoppy};
  border-radius: 50%;
  display: inline-block;
`

const MessageText = styled.span`
  vertical-align: text-top;
  line-height: 11px;
  margin: 0 3px 0 3px;
  font-size: 11px;
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
  background: ${COLORS.white};
  padding: 5px 9px 9px 9px;
  margin-left: 10px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  flex-grow: 4;
`

const VoyageNumber = styled.div`
  text-align: center;
  background: ${COLORS.white};
  padding: 5px 9px 9px 9px;
  margin-left: 10px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  flex-grow: 3;
  max-width: 80px;
  overflow: clip;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const ReceptionDateTime = styled.div`
  text-align: center;
  background: ${COLORS.white};
  padding: 5px 8px 9px 8px;
  margin-left: 10px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  flex-grow: 3;
`

const EmissionDateTime = styled.div`
  text-align: center;
  background: ${COLORS.white};
  padding: 5px 8px 9px 8px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  flex-grow: 3;
`

const LogbookMessageMetadata = styled.div`
 display: flex;
`

const Body = styled.div`
  padding: 10px;
  background: ${COLORS.gainsboro};
`

const Wrapper = styled.div`
  margin-top: ${props => props.isFirst ? '5' : '10'}px;
  font-size: 13px;
  background: ${COLORS.white};
  text-align: left;
`

const Header = styled.div`
  height: 35px;
  width: inherit;
  padding: 0 0 0 10px;
  background: ${COLORS.charcoal};
  display: flex;
`

const LogbookMessageHeaderText = styled.span`
  color: ${COLORS.white};
  font-weight: 500;
  margin: 5px 5px 5px 5px;
  padding: 3px 4px 2px 0;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  max-width: ${props => props.isShortcut ? '185px' : '330px'};
`

const LogbookMessageName = styled.span`
  color: ${COLORS.gainsboro};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 0;
  font-size: 13px;
`

const LogbookMessageType = styled.span`
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
  margin-right: 8px;
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

const ShowActivity = styled(ShowActivitySVG)`
  height: 19px;
  width: 15px;
  margin-top: 8px;
  margin-right: 10px;
  cursor: pointer;
`

const HideActivity = styled(HideActivitySVG)`
  height: 19px;
  width: 15px;
  margin-top: 8px;
  margin-right: 10px;
  cursor: pointer;
`

export default LogbookMessage
