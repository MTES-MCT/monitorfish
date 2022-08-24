import React, { useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import {
  beaconMalfunctionNotificationRecipientFunction,
  beaconMalfunctionNotificationType,
  communicationMeans,
} from '../../../domain/entities/beaconMalfunction'
import { ReactComponent as NotOkSVG } from '../../icons/Icon_not_OK.svg'
import { ReactComponent as OkSVG } from '../../icons/Icon_OK.svg'

function BeaconMalfunctionsDetailsFollowUpNotification({ notification }) {
  const [showDetails, setShowDetails] = useState(false)
  const followUpMessage =
    beaconMalfunctionNotificationType[notification.notificationType]?.followUpMessage || 'Un message a été envoyé'

  const notReceivedMeans = notification.notifications
    .filter(notificationMeans => notificationMeans.success === false)
    .map(notificationMeans => {
      const means = communicationMeans[notificationMeans.communicationMeans]?.denomination || ''
      const addresseePreposition = communicationMeans[notificationMeans.communicationMeans]?.addresseePreposition || ''
      
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

  const recipientFunctions = notification.notifications.reduce((recipientFunctionGroup, notification) => {
    const { recipientFunction } = notification

    recipientFunctionGroup[recipientFunction] = recipientFunctionGroup[recipientFunction] ?? []
    recipientFunctionGroup[recipientFunction].push(notification)

    return recipientFunctionGroup
  }, {})

  return (
    <>
      Une <FollowUpMessage style={followUpMessageStyle}>{followUpMessage}</FollowUpMessage> a été envoyée
      <br />
      {showDetails ? (
        <Fields style={fieldsStyle}>
          {Object.keys(recipientFunctions).map(recipientFunction => <Field key={recipientFunction} style={fieldStyle}>
                  <Key style={keyStyle}>{beaconMalfunctionNotificationRecipientFunction[recipientFunction]?.addressee || ''}</Key>
                  <Value style={valueStyle}>
                    {
                      recipientFunctions[recipientFunction]
                        .map(notification => {
                          const means = communicationMeans[notification.communicationMeans] !== communicationMeans.EMAIL
                            ? communicationMeans[notification.communicationMeans]?.denomination
                            : ''
                          const meansResponse = getMeansResponseIcon(notification)

                          return <>
                            {notification.recipientAddressOrNumber}
                            {' '}{means ? <>({means})</> : ''}
                            {meansResponse}
                            <br/>
                          </>
                        })
                    }
                  </Value>
                </Field>)
          })}
        </Fields>
      ) : (
        notReceivedMeans.map(notReceived => notReceived)
      )}
      <ShowDetails
        data-cy="side-window-beacon-malfunctions-notification-show-details"
        style={showDetailsStyle}
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Masquer' : 'Voir'} le détail
      </ShowDetails>
    </>
  )
}

function getMeansResponseIcon(notification) {
  let meansResponse = ''

  if (communicationMeans[notification.communicationMeans] === communicationMeans.EMAIL) {
    switch (notification.success) {
      case true:
        meansResponse = <Ok style={okStyle} />
        break
      case false:
        meansResponse = (
          <NotOk style={notOkStyle} title={notification.errorMessage ? notification.errorMessage : 'Erreur inconnue'} />
        )
        break
    }
  }

  return meansResponse
}

const FollowUpMessage = styled.span``
const followUpMessageStyle = {
  fontWeight: 700,
  textTransform: 'lowercase',
}

const ShowDetails = styled.div``
const showDetailsStyle = {
  font: 'normal normal medium 13px/22px Marianne',
  color: COLORS.gunMetal,
  textDecoration: 'underline',
  cursor: 'pointer',
}

const NotOk = styled(NotOkSVG)``
const notOkStyle = {
  marginRight: 5,
  verticalAlign: 'sub',
}

const Ok = styled(OkSVG)``
const okStyle = {
  marginRight: 5,
  verticalAlign: 'sub',
}

const Fields = styled.table``
const fieldsStyle = {
  display: 'table',
  margin: 0,
  width: 'inherit',
}

const Field = styled.tr``
const fieldStyle = {
  border: 'none',
  background: 'none',
  margin: '5px 5px 5px 0',
}

const Key = styled.th``
const keyStyle = {
  color: COLORS.slateGray,
  border: 'none',
  display: 'inline-block',
  background: 'none',
  margin: 0,
  fontSize: 13,
  padding: '5px 5px 5px 0',
  fontWeight: 'normal',
  width: 100,
}

const Value = styled.td``
const valueStyle = {
  color: COLORS.gunMetal,
  fontSize: 13,
  margin: 0,
  padding: '5px 5px 5px 5px',
  background: 'none',
  textAlign: 'left',
  border: 'none',
  fontWeight: 500,
  lineHeight: 'normal',
}

export default BeaconMalfunctionsDetailsFollowUpNotification
