import { Ellipsised } from '@components/Ellipsised'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { getComponentFromMessageType } from './constants'
import { getDateTime } from '../../../../../../utils'
import XMLSVG from '../../../../../icons/Picto_XML.svg?react'
import ShowActivitySVG from '../../../../../icons/Position_message_JPE_Pin_gris_clair.svg?react'
import HideActivitySVG from '../../../../../icons/Position_message_JPE_Pin_masquer.svg?react'
import { LogbookMessageType as LogbookMessageTypeEnum } from '../../../../constants'
import { LogbookMessage as LogbookMessageNamespace } from '../../../../LogbookMessage.types'
import { logbookActions } from '../../../../slice'
import { getLogbookMessageType } from '../../../../utils'

import type { LogbookMessage as LogbookMessageType } from '../../../../Logbook.types'

type LogbookMessageComponentProps = Readonly<{
  isFirst: boolean
  isLessThanTwelveMetersVessel?: boolean
  logbookMessage: LogbookMessageType | LogbookMessageNamespace.LogbookMessage
  withMapControls?: boolean
}>
export function LogbookMessage({
  isFirst,
  isLessThanTwelveMetersVessel = false,
  logbookMessage,
  withMapControls = false
}: LogbookMessageComponentProps) {
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
      case LogbookMessageTypeEnum.PNO.code.toString(): {
        if (isLessThanTwelveMetersVessel) {
          return 'Préavis (notification de retour au port) – navire sans JPE'
        }

        return LogbookMessageTypeEnum[logbookMessage.messageType].fullName
      }
      default: {
        return LogbookMessageTypeEnum[logbookMessage.messageType].fullName
      }
    }
  }, [logbookMessage, isLessThanTwelveMetersVessel])

  const openXML = (xml: string) => {
    const blob = new Blob([xml], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    window.open(url)
    URL.revokeObjectURL(url)
  }

  const logbookMessageComponent = useMemo(
    () => getComponentFromMessageType(logbookMessage, isLessThanTwelveMetersVessel),
    [logbookMessage, isLessThanTwelveMetersVessel]
  )

  return (
    <Wrapper id={logbookMessage.operationNumber} isFirst={isFirst}>
      <Header>
        {!isLessThanTwelveMetersVessel && (
          <LogbookMessageTypeText>{getLogbookMessageType(logbookMessage)}</LogbookMessageTypeText>
        )}
        <LogbookMessageHeaderText
          data-cy="vessel-fishing-message"
          isShortcut={
            logbookMessage.isCorrectedByNewerMessage || logbookMessage.isDeleted || !!logbookMessage.referencedReportId
          }
          title={logbookHeaderTitle}
        >
          {logbookHeaderTitle}
        </LogbookMessageHeaderText>

        {logbookMessage.isCorrectedByNewerMessage && (
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
        {logbookMessage.operationType === LogbookMessageNamespace.OperationType.COR && (
          <OperationTag>
            <OperationTagWarningBullet />
            <OperationTagLabel>MESSAGE CORRIGÉ</OperationTagLabel>
          </OperationTag>
        )}

        {!isLessThanTwelveMetersVessel && logbookMessage.rawMessage && (
          <Xml
            onClick={() => openXML(logbookMessage.rawMessage)}
            style={{ cursor: 'pointer' }}
            title="Ouvrir le message XML brut"
          />
        )}

        {withMapControls &&
          !logbookMessage.isCorrectedByNewerMessage &&
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
            <Key>{isLessThanTwelveMetersVessel ? 'Date de saisie dans MF par le CNSP' : 'Date d’émission'}</Key>
            {getDateTime(logbookMessage.reportDateTime, true)}
          </EmissionDateTime>
          <ReceptionDateTime>
            <Key>{isLessThanTwelveMetersVessel ? 'Date de réception par le CNSP' : 'Date de réception'}</Key>
            {getDateTime(logbookMessage.integrationDateTime, true)}
          </ReceptionDateTime>
          {!isLessThanTwelveMetersVessel && (
            <VoyageNumber>
              <Key>N° de marée</Key>
              {logbookMessage.tripNumber ? (
                <Ellipsised maxWidth={80}>{logbookMessage.tripNumber}</Ellipsised>
              ) : (
                <Gray>-</Gray>
              )}
            </VoyageNumber>
          )}
          {!isLessThanTwelveMetersVessel && (
            <Acknowledge>
              <Key>Acq.</Key>
              {!logbookMessage.acknowledgment || (logbookMessage.acknowledgment.isSuccess === null && <Gray>-</Gray>)}
              {logbookMessage.acknowledgment?.isSuccess === true && (
                <Icon.Confirm
                  color={THEME.color.mediumSeaGreen}
                  data-cy="LogbookMessage-successful-acknowledgement-icon"
                />
              )}
              {logbookMessage.acknowledgment?.isSuccess === false && (
                <Icon.Reject
                  color={THEME.color.maximumRed}
                  data-cy="LogbookMessage-failed-acknowledgement-icon"
                  title={logbookMessage.acknowledgment?.rejectionCause ?? ''}
                />
              )}
            </Acknowledge>
          )}
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
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.gunMetal};
  display: flex;
  flex-direction: column;
  font-size: 13px;
  padding: 10px;

  > span:first-child {
    margin-bottom: 4px;
  }
`
const EmissionDateTime = styled(BodyHeaderBlock)`
  flex-grow: 3;
`
const ReceptionDateTime = styled(BodyHeaderBlock)`
  flex-grow: 3;
  margin-left: 10px;
`
const VoyageNumber = styled(BodyHeaderBlock)`
  flex-grow: 3;
  margin-left: 10px;
  max-width: 80px;
`
const Acknowledge = styled(BodyHeaderBlock)`
  flex-grow: 4;
  width: 25px;
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
