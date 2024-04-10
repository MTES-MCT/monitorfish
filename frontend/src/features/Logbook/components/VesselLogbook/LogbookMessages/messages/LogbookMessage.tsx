import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { getComponentFromMessageType } from './constants'
import { useMainAppDispatch } from '../../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { getDateTime } from '../../../../../../utils'
import XMLSVG from '../../../../../icons/Picto_XML.svg?react'
import ShowActivitySVG from '../../../../../icons/Position_message_JPE_Pin_gris_clair.svg?react'
import HideActivitySVG from '../../../../../icons/Position_message_JPE_Pin_masquer.svg?react'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../constants'
import { logbookActions } from '../../../../slice'
import { getLogbookMessageType } from '../../../../utils'

import type { LogbookMessage as LogbookMessageType } from '../../../../Logbook.types'
import type { LogbookMessage as LogbookMessageNamespace } from '../../../../LogbookMessage.types'

type LogbookMessageComponentProps = Readonly<{
  isFirst: boolean
  logbookMessage: LogbookMessageType | LogbookMessageNamespace.LogbookMessage
}>
export function LogbookMessage({ isFirst, logbookMessage }: LogbookMessageComponentProps) {
  const dispatch = useMainAppDispatch()
  const fishingActivitiesShowedOnMap = useMainAppSelector(state => state.fishingActivities.fishingActivitiesShowedOnMap)

  const logbookHeaderTitle = useMemo(() => {
    switch (logbookMessage.messageType) {
      case LogbookMessageTypeEnum.DEP.code.toString(): {
        return (
          <>
            <LogbookMessageName>{LogbookMessageTypeEnum[logbookMessage.messageType].name}</LogbookMessageName>
            {logbookMessage.message.departurePortName || logbookMessage.message.departurePort} le{' '}
            {getDateTime(logbookMessage.message.departureDatetimeUtc, true)} <Gray>(UTC)</Gray>
          </>
        )
      }
      default: {
        return LogbookMessageTypeEnum[logbookMessage.messageType].fullName
      }
    }
  }, [logbookMessage])

  const openXML = xml => {
    const blob = new Blob([xml], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    window.open(url)
    URL.revokeObjectURL(url)
  }

  const logbookMessageComponent = useMemo(() => getComponentFromMessageType(logbookMessage), [logbookMessage])

  return (
    <Wrapper id={logbookMessage.operationNumber} isFirst={isFirst}>
      <Header>
        <LogbookMessageTypeText>{getLogbookMessageType(logbookMessage)}</LogbookMessageTypeText>
        <LogbookMessageHeaderText
          data-cy="vessel-fishing-message"
          isShortcut={logbookMessage.isCorrected || logbookMessage.isDeleted || !!logbookMessage.referencedReportId}
          title={logbookHeaderTitle}
        >
          {logbookHeaderTitle}
        </LogbookMessageHeaderText>

        {!logbookMessage.isConsolidated && logbookMessage.isCorrected && (
          <OperationTag>
            <OperationTagDangerBullet />
            <OperationTagLabel>ANCIEN MESSAGE</OperationTagLabel>
          </OperationTag>
        )}
        {logbookMessage.isDeleted && (
          <OperationTag>
            <OperationTagDangerBullet />
            <OperationTagLabel>MESSAGE SUPPRIMÉ</OperationTagLabel>
          </OperationTag>
        )}
        {((!logbookMessage.isConsolidated && !!logbookMessage.referencedReportId) ||
          (logbookMessage.isConsolidated && logbookMessage.isCorrected)) && (
          <OperationTag>
            <OperationTagWarningBullet />
            <OperationTagLabel>MESSAGE CORRIGÉ</OperationTagLabel>
          </OperationTag>
        )}

        {logbookMessage.rawMessage ? (
          <Xml
            onClick={() => openXML(logbookMessage.rawMessage)}
            style={{ cursor: 'pointer' }}
            title="Ouvrir le message XML brut"
          />
        ) : (
          <Xml />
        )}

        {!logbookMessage.isCorrected &&
          (fishingActivitiesShowedOnMap.find(showed => showed.id === logbookMessage.operationNumber) ? (
            <HideActivity
              data-cy="hide-fishing-activity"
              onClick={() => dispatch(logbookActions.removeFromMap(logbookMessage.operationNumber))}
              title="Cacher le message sur la piste"
            />
          ) : (
            <ShowActivity
              data-cy="show-fishing-activity"
              onClick={() => dispatch(logbookActions.showOnMap(logbookMessage.operationNumber))}
              title="Afficher le message sur la piste"
            />
          ))}
      </Header>
      <Body data-cy="vessel-fishing-message-body">
        {logbookMessage.isSentByFailoverSoftware && (
          <SoftwareFailover>
            <MessageSentByFailoverSoftwareIcon />
            Message envoyé via e-sacapt
          </SoftwareFailover>
        )}
        <LogbookMessageMetadata>
          <EmissionDateTime>
            <Key>Date d’émission</Key>
            <br />
            {getDateTime(logbookMessage.reportDateTime, true)}
          </EmissionDateTime>
          <ReceptionDateTime>
            <Key>Date de réception</Key>
            <br />
            {getDateTime(logbookMessage.integrationDateTime, true)}
          </ReceptionDateTime>
          <VoyageNumber title={logbookMessage.tripNumber?.toString()}>
            <Key>N° de marée</Key>
            <br />
            {logbookMessage.tripNumber ?? <Gray>-</Gray>}
          </VoyageNumber>
          <Acknowledge>
            <Key>Acq.</Key>
            <br />
            {!logbookMessage.acknowledge || (logbookMessage.acknowledge.isSuccess === null && <Gray>-</Gray>)}
            {logbookMessage.acknowledge?.isSuccess === true && (
              <Icon.Confirm
                color={THEME.color.mediumSeaGreen}
                data-cy="LogbookMessage-successful-acknowledgement-icon"
              />
            )}
            {logbookMessage.acknowledge?.isSuccess === false && (
              <Icon.Reject
                color={THEME.color.maximumRed}
                data-cy="LogbookMessage-failed-acknowledgement-icon"
                title={logbookMessage.acknowledge?.rejectionCause ?? ''}
              />
            )}
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

const OperationTag = styled.span`
  background: ${p => p.theme.color.gainsboro};
  border-radius: 11px;
  color: ${p => p.theme.color.gunMetal};
  font-size: 11px;
  height: 17px;
  margin: 7px 7px 7px 3px;
  padding: 3.5px 5px 0.5px 2px;
  white-space: nowrap;
`
const OperationTagDangerBullet = styled.span`
  height: 14px;
  margin-left: 3px;
  width: 14px;
  background-color: ${p => p.theme.color.maximumRed};
  border-radius: 50%;
  display: inline-block;
`
const OperationTagWarningBullet = styled.span`
  height: 14px;
  margin-left: 3px;
  width: 14px;
  background-color: ${p => p.theme.color.mediumSeaGreen};
  border-radius: 50%;
  display: inline-block;
`
const OperationTagLabel = styled.span`
  font-size: 11px;
  line-height: 11px;
  margin: 0 4px;
  vertical-align: 2.5px;
  white-space: nowrap;
`

const Gray = styled.span`
  color: ${p => p.theme.color.gainsboro};
  font-weight: 300;
`

const Key = styled.span`
  color: ${p => p.theme.color.slateGray};
  line-height: 18px;
  margin-bottom: 2px;
`

// Body Header

const BodyHeaderBlock = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  font-size: 13px;
  padding: 10px;
`
const EmissionDateTime = styled(BodyHeaderBlock)`
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  flex-grow: 3;
`
const ReceptionDateTime = styled(BodyHeaderBlock)`
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  flex-grow: 3;
  margin-left: 10px;
`
const VoyageNumber = styled(BodyHeaderBlock)`
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  flex-grow: 3;
  margin-left: 10px;
  max-width: 80px;
  overflow: clip;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const Acknowledge = styled(BodyHeaderBlock)`
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  flex-grow: 4;
  margin-left: 10px;
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
  background: ${p => p.theme.color.charcoal};
  display: flex;
  height: 35px;
  padding: 0 0 0 10px;
  width: inherit;
`

const LogbookMessageHeaderText = styled.span<{
  isShortcut: boolean
}>`
  color: ${p => p.theme.color.white};
  flex-grow: 1;
  font-size: 13px;
  font-weight: 500;
  margin: 5px 5px 5px 5px;
  /* max-width: ${p => (p.isShortcut ? '185px' : '330px')}; */
  overflow: hidden !important;
  padding: 3px 4px 2px 0;
  text-overflow: ellipsis;
  vertical-align: -moz-middle-with-baseline;
  vertical-align: -webkit-baseline-middle;
  white-space: nowrap;
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
