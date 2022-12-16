import { CSSProperties, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import {
  NOTIFICATION_RECIPIENT_FUNCTION,
  NOTIFICATION_TYPE,
  COMMUNICATION_MEAN
} from '../../../domain/entities/beaconMalfunction/constants'
import { ReactComponent as NotOkSVG } from '../../icons/Icon_not_OK.svg'
import { ReactComponent as OkSVG } from '../../icons/Icon_OK.svg'

export function BeaconMalfunctionsDetailsFollowUpNotification({ notification }) {
  const [showDetails, setShowDetails] = useState(false)
  const followUpMessage = NOTIFICATION_TYPE[notification.notificationType]?.followUpMessage || 'Un message a été envoyé'

  const notReceivedMeans = notification.notifications
    .filter(notificationMeans => notificationMeans.success === false)
    .map(notificationMeans => {
      const means = COMMUNICATION_MEAN[notificationMeans.communicationMeans]?.denomination || ''
      const addresseePreposition = COMMUNICATION_MEAN[notificationMeans.communicationMeans]?.addresseePreposition || ''

      return (
        <>
          <NotOk
            style={notOkStyle}
            title={notificationMeans.errorMessage ? notificationMeans.errorMessage : 'Erreur inconnue'}
          />
          {means} non reçu {addresseePreposition} {notificationMeans.recipientAddressOrNumber}
          <br />
        </>
      )
    })

  const recipientFunctions = notification.notifications.reduce((_recipientFunctionGroup, _notification) => {
    const { recipientFunction } = _notification
    const recipientFunctionGroup = { ..._recipientFunctionGroup }

    recipientFunctionGroup[recipientFunction] = recipientFunctionGroup[recipientFunction] ?? []
    recipientFunctionGroup[recipientFunction].push(_notification)

    return recipientFunctionGroup
  }, {})

  return (
    <>
      Une <FollowUpMessage style={followUpMessageStyle}>{followUpMessage}</FollowUpMessage> a été envoyée
      <br />
      {showDetails ? (
        <Fields style={fieldsStyle}>
          {Object.keys(recipientFunctions).map(recipientFunction => (
            <Field key={recipientFunction} style={fieldStyle}>
              <Key style={keyStyle}>{NOTIFICATION_RECIPIENT_FUNCTION[recipientFunction]?.addressee || ''}</Key>
              <Value style={valueStyle}>
                {recipientFunctions[recipientFunction].map(_notification => {
                  const means =
                    COMMUNICATION_MEAN[_notification.communicationMeans] !== COMMUNICATION_MEAN.EMAIL
                      ? COMMUNICATION_MEAN[_notification.communicationMeans]?.denomination
                      : ''
                  const meansResponse = getMeansResponseIcon(_notification)

                  return (
                    <>
                      {_notification.recipientAddressOrNumber} {means ? <>({means})</> : ''}
                      {meansResponse}
                      <br />
                    </>
                  )
                })}
              </Value>
            </Field>
          ))}
        </Fields>
      ) : (
        notReceivedMeans.map(notReceived => notReceived)
      )}
      <ShowDetails
        data-cy="side-window-beacon-malfunctions-notification-show-details"
        onClick={() => setShowDetails(!showDetails)}
        style={showDetailsStyle}
      >
        {showDetails ? 'Masquer' : 'Voir'} le détail
      </ShowDetails>
    </>
  )
}

function getMeansResponseIcon(notification) {
  let meansResponse: JSX.Element | undefined

  if (COMMUNICATION_MEAN[notification.communicationMeans] === COMMUNICATION_MEAN.EMAIL) {
    switch (notification.success) {
      case true:
        meansResponse = <Ok style={okStyle} />
        break
      case false:
        meansResponse = (
          <NotOk style={notOkStyle} title={notification.errorMessage ? notification.errorMessage : 'Erreur inconnue'} />
        )
        break
      default:
        throw new Error('This should never happen.')
    }
  }

  return meansResponse
}

const FollowUpMessage = styled.span``
const followUpMessageStyle: CSSProperties = {
  fontWeight: 700,
  textTransform: 'lowercase'
}

const ShowDetails = styled.div``
const showDetailsStyle = {
  color: COLORS.gunMetal,
  cursor: 'pointer',
  font: 'normal normal medium 13px/22px Marianne',
  textDecoration: 'underline'
}

const NotOk = styled(NotOkSVG)``
const notOkStyle = {
  marginRight: 5,
  verticalAlign: 'sub'
}

const Ok = styled(OkSVG)``
const okStyle = {
  marginRight: 5,
  verticalAlign: 'sub'
}

const Fields = styled.table``
const fieldsStyle = {
  display: 'table',
  margin: 0,
  width: 'inherit'
}

const Field = styled.tr``
const fieldStyle = {
  background: 'none',
  border: 'none',
  margin: '5px 5px 5px 0'
}

const Key = styled.th``
const keyStyle = {
  background: 'none',
  border: 'none',
  color: COLORS.slateGray,
  display: 'inline-block',
  fontSize: 13,
  fontWeight: 'normal',
  margin: 0,
  padding: '5px 5px 5px 0',
  width: 100
}

const Value = styled.td``
const valueStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  color: COLORS.gunMetal,
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 'normal',
  margin: 0,
  padding: '5px 5px 5px 5px',
  textAlign: 'left'
}
