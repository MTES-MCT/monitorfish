import { useMemo } from 'react'
import styled from 'styled-components'

import { COEMessage } from './COEMessage'
import { COXMessage } from './COXMessage'
import { CROMessage } from './CROMessage'
import { DEPMessage } from './DEPMessage'
import { DISMessage } from './DISMessage'
import { EOFMessage } from './EOFMessage'
import { FARMessage } from './FARMessage'
import LANMessage from './LANMessage'
import { NotImplementedMessage } from './NotImplementedMessage'
import PNOMessage from './PNOMessage'
import RTPMessage from './RTPMessage'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { getDateTime } from '../../../../../utils'
import AckNOkSVG from '../../../../icons/Icon_not_OK.svg?react'
import AckOkSVG from '../../../../icons/Message_JPE_acquitté.svg?react'
import XMLSVG from '../../../../icons/Picto_XML.svg?react'
import ShowActivitySVG from '../../../../icons/Position_message_JPE_Pin_gris_clair.svg?react'
import HideActivitySVG from '../../../../icons/Position_message_JPE_Pin_masquer.svg?react'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../constants'
import { logbookActions } from '../../../slice'
import { getLogbookMessageType } from '../../../utils'

import type { LogbookMessage as LogbookMessageType } from '../../../Logbook.types'
import type { HTMLProps } from 'react'

type LogbookMessageComponentType = {
  isFirst: boolean
  message: LogbookMessageType
}
export function LogbookMessage({ isFirst, message }: LogbookMessageComponentType) {
  const dispatch = useMainAppDispatch()
  const fishingActivitiesShowedOnMap = useMainAppSelector(state => state.fishingActivities.fishingActivitiesShowedOnMap)

  const logbookHeaderTitle = useMemo(() => {
    switch (message.messageType) {
      case LogbookMessageTypeEnum.DEP.code.toString(): {
        return (
          <>
            <LogbookMessageName>{LogbookMessageTypeEnum[message.messageType].name}</LogbookMessageName>
            {message.message.departurePortName || message.message.departurePort} le{' '}
            {getDateTime(message.message.departureDatetimeUtc, true)} <Gray>(UTC)</Gray>
          </>
        )
      }
      default: {
        return LogbookMessageTypeEnum[message.messageType].fullName
      }
    }
  }, [message])

  const openXML = xml => {
    const blob = new Blob([xml], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    window.open(url)
    URL.revokeObjectURL(url)
  }

  const logbookMessageComponent = useMemo(() => {
    switch (message.messageType) {
      case LogbookMessageTypeEnum.DEP.code:
        return <DEPMessage message={message.message} />
      case LogbookMessageTypeEnum.FAR.code:
        return <FARMessage message={message.message} />
      case LogbookMessageTypeEnum.PNO.code:
        return <PNOMessage message={message.message} />
      case LogbookMessageTypeEnum.LAN.code:
        return <LANMessage message={message.message} />
      case LogbookMessageTypeEnum.RTP.code:
        return <RTPMessage message={message.message} />
      case LogbookMessageTypeEnum.EOF.code:
        return <EOFMessage message={message.message} />
      case LogbookMessageTypeEnum.COE.code:
        return <COEMessage message={message.message} />
      case LogbookMessageTypeEnum.NOT_COE.code:
        return <COEMessage message={message.message} />
      case LogbookMessageTypeEnum.COX.code:
        return <COXMessage message={message.message} />
      case LogbookMessageTypeEnum.NOT_COX.code:
        return <COXMessage message={message.message} />
      case LogbookMessageTypeEnum.JFO.code:
        return <NotImplementedMessage />
      case LogbookMessageTypeEnum.CRO.code:
        return <CROMessage message={message.message} />
      case LogbookMessageTypeEnum.DIS.code:
        return <DISMessage message={message.message} />
      case LogbookMessageTypeEnum.RLC.code:
        return <NotImplementedMessage />
      case LogbookMessageTypeEnum.TRA.code:
        return <NotImplementedMessage />
      case LogbookMessageTypeEnum.NOT_TRA.code:
        return <NotImplementedMessage />
      case LogbookMessageTypeEnum.GEAR_SHOT.code:
        return <NotImplementedMessage />
      case LogbookMessageTypeEnum.GEAR_RETRIEVAL.code:
        return <NotImplementedMessage />
      case LogbookMessageTypeEnum.START_ACTIVITY.code:
        return <NotImplementedMessage />
      case LogbookMessageTypeEnum.START_FISHING.code:
        return <NotImplementedMessage />
      default:
        return undefined
    }
  }, [message])

  return (
    <Wrapper id={message.operationNumber} isFirst={isFirst}>
      <Header>
        <LogbookMessageTypeText>{getLogbookMessageType(message)}</LogbookMessageTypeText>
        <LogbookMessageHeaderText
          data-cy="vessel-fishing-message"
          isShortcut={message.isCorrected || message.deleted || !!message.referencedReportId}
          title={logbookHeaderTitle}
        >
          {logbookHeaderTitle}
        </LogbookMessageHeaderText>
        {message.isCorrected && (
          <CorrectedMessage>
            <MessageCorrected />
            <MessageText>ANCIEN MESSAGE</MessageText>
          </CorrectedMessage>
        )}
        {message.deleted && (
          <CorrectedMessage>
            <MessageCorrected />
            <MessageText>MESSAGE SUPPRIMÉ</MessageText>
          </CorrectedMessage>
        )}
        {message.referencedReportId && (
          <CorrectedMessage>
            <MessageOK />
            <MessageText>MESSAGE CORRIGÉ</MessageText>
          </CorrectedMessage>
        )}
        {message.rawMessage ? (
          <Xml
            onClick={() => openXML(message.rawMessage)}
            style={{ cursor: 'pointer' }}
            title="Ouvrir le message XML brut"
          />
        ) : (
          <Xml />
        )}
        {!message.isCorrected &&
          (fishingActivitiesShowedOnMap.find(showed => showed.id === message.operationNumber) ? (
            <HideActivity
              data-cy="hide-fishing-activity"
              onClick={() => dispatch(logbookActions.removeFromMap(message.operationNumber))}
              title="Cacher le message sur la piste"
            />
          ) : (
            <ShowActivity
              data-cy="show-fishing-activity"
              onClick={() => dispatch(logbookActions.showOnMap(message.operationNumber))}
              title="Afficher le message sur la piste"
            />
          ))}
      </Header>
      <Body data-cy="vessel-fishing-message-body">
        {message.isSentByFailoverSoftware && (
          <SoftwareFailover>
            <MessageSentByFailoverSoftwareIcon />
            Message envoyé via e-sacapt
          </SoftwareFailover>
        )}
        <LogbookMessageMetadata>
          <EmissionDateTime>
            <Key>Date de saisie</Key>
            <br />
            {getDateTime(message.reportDateTime, true)}
          </EmissionDateTime>
          <ReceptionDateTime>
            <Key>Date de réception</Key>
            <br />
            {getDateTime(message.integrationDateTime, true)}
          </ReceptionDateTime>
          <VoyageNumber title={message.tripNumber.toString()}>
            <Key>N° de marée</Key>
            <br />
            {message.tripNumber || <Gray>-</Gray>}
          </VoyageNumber>
          <Acknowledge>
            <Key>Acq.</Key>
            <br />
            {!message.acknowledge || (message.acknowledge.isSuccess === null && <Gray>-</Gray>)}
            {message.acknowledge?.isSuccess === true && <AckOk />}
            {message.acknowledge?.isSuccess === false && <AckNOk title={message.acknowledge?.rejectionCause || ''} />}
          </Acknowledge>
        </LogbookMessageMetadata>
        {logbookMessageComponent}
      </Body>
    </Wrapper>
  )
}

const SoftwareFailover = styled.div`
  padding: 9px 10px 9px 10px;
  margin-bottom: 10px;
  text-align: center;
  color: ${p => p.theme.color.white};
  font-size: 13px;
  background: ${p => p.theme.color.slateGray};
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
  /* TODO Replace with theme color. */
  background-color: #e1000f;
  border-radius: 50%;
  display: inline-block;
`

const MessageOK = styled.span`
  height: 14px;
  margin-left: 3px;
  width: 14px;
  background-color: #8cc61f;
  border-radius: 50%;
  display: inline-block;
`

const CorrectedMessage = styled.span`
  border-radius: 11px;
  background: ${p => p.theme.color.gainsboro};
  font-size: 11px;
  color: ${p => p.theme.color.gunMetal};
  margin: 7px 7px 7px 3px;
  height: 17px;
  padding: 3px 5px 0px 2px;
`

const Gray = styled.span`
  color: ${p => p.theme.color.gainsboro};
  font-weight: 300;
`

const Key = styled.span`
  color: ${p => p.theme.color.slateGray};
`

const Acknowledge = styled.div`
  text-align: center;
  background: ${p => p.theme.color.white};
  padding: 5px 9px 9px 9px;
  margin-left: 10px;
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  flex-grow: 4;
`

const VoyageNumber = styled.div<HTMLProps<HTMLDivElement>>`
  text-align: center;
  background: ${p => p.theme.color.white};
  padding: 5px 9px 9px 9px;
  margin-left: 10px;
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  flex-grow: 3;
  max-width: 80px;
  overflow: clip;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const ReceptionDateTime = styled.div`
  text-align: center;
  background: ${p => p.theme.color.white};
  padding: 5px 8px 9px 8px;
  margin-left: 10px;
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  flex-grow: 3;
`

const EmissionDateTime = styled.div`
  text-align: center;
  background: ${p => p.theme.color.white};
  padding: 5px 8px 9px 8px;
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  flex-grow: 3;
`

const LogbookMessageMetadata = styled.div`
  display: flex;
`

const Body = styled.div`
  padding: 10px;
  background: ${p => p.theme.color.gainsboro};
`

const Wrapper = styled.div<{
  isFirst: boolean
}>`
  margin-top: ${p => (p.isFirst ? '5' : '10')}px;
  font-size: 13px;
  background: ${p => p.theme.color.white};
  text-align: left;
`

const Header = styled.div`
  height: 35px;
  width: inherit;
  padding: 0 0 0 10px;
  background: ${p => p.theme.color.charcoal};
  display: flex;
`

const LogbookMessageHeaderText = styled.span<{
  isShortcut: boolean
}>`
  color: ${p => p.theme.color.white};
  font-weight: 500;
  margin: 5px 5px 5px 5px;
  padding: 3px 4px 2px 0;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden !important;
  max-width: ${p => (p.isShortcut ? '185px' : '330px')};
`

const LogbookMessageName = styled.span`
  color: ${p => p.theme.color.gainsboro};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 0;
  font-size: 13px;
`

const LogbookMessageTypeText = styled.span`
  border: 2px solid ${p => p.theme.color.gainsboro};
  color: ${p => p.theme.color.gainsboro};
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

const Xml = styled(XMLSVG)`
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
