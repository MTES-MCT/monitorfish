import React, { useState } from 'react'
import styled from 'styled-components'
import {
  beaconMalfunctionNotificationRecipientFunction,
  beaconMalfunctionNotificationType,
  communicationMeans
} from '../../../domain/entities/beaconMalfunction'
import { ReactComponent as NotOkSVG } from '../../icons/Icon_not_OK.svg'
import { ReactComponent as OkSVG } from '../../icons/Icon_OK.svg'
import { COLORS } from '../../../constants/constants'

const BeaconMalfunctionsDetailsFollowUpNotification = ({ notification }) => {
  const [showDetails, setShowDetails] = useState(false)
  const followUpMessage = beaconMalfunctionNotificationType[notification.notificationType]?.followUpMessage || 'Un message a été envoyé'

  const notReceivedMeans = notification.notifications
    .filter(notificationMeans => notificationMeans.success === false)
    .map(notificationMeans => {
      const means = communicationMeans[notificationMeans.communicationMeans]?.denomination || ''
      const addresseePreposition = communicationMeans[notificationMeans.communicationMeans]?.addresseePreposition || ''
      return <>
        <NotOk
          style={notOkStyle}
          title={notificationMeans.errorMessage ? notificationMeans.errorMessage : 'Erreur inconnue'}
        />
        {means} non reçu {addresseePreposition} {notificationMeans.recipientAddressOrNumber}<br/>
      </>
    })

  const recipientFunctions = notification.notifications.reduce((recipientFunctionGroup, notification) => {
    const { recipientFunction } = notification

    recipientFunctionGroup[recipientFunction] = recipientFunctionGroup[recipientFunction] ?? []
    recipientFunctionGroup[recipientFunction].push(notification)

    return recipientFunctionGroup
  }, {})

  return <>
    Une <FollowUpMessage style={followUpMessageStyle}>{followUpMessage}</FollowUpMessage> a été envoyée<br/>
    {
      showDetails
        ? <Fields style={fieldsStyle}>
          {
            Object.keys(recipientFunctions)
              .map(recipientFunction => {
                return <Field key={recipientFunction} style={fieldStyle}>
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
                </Field>
              })
          }
        </Fields>
        : notReceivedMeans.map(notReceived => notReceived)
    }
    <ShowDetails
      data-cy={'side-window-beacon-malfunctions-notification-show-details'}
      style={showDetailsStyle}
      onClick={() => setShowDetails(!showDetails)}
    >
      {showDetails ? 'Masquer' : 'Voir'} le détail
    </ShowDetails>
  </>
}

function getMeansResponseIcon (notification) {
  let meansResponse = ''

  if (communicationMeans[notification.communicationMeans] === communicationMeans.EMAIL) {
    switch (notification.success) {
      case true:
        meansResponse = <Ok style={okStyle}/>
        break
      case false:
        meansResponse = <NotOk
          style={notOkStyle}
          title={notification.errorMessage ? notification.errorMessage : 'Erreur inconnue'}
        />
        break
    }
  }

  return meansResponse
}

const FollowUpMessage = styled.span``
const followUpMessageStyle = {
  fontWeight: 700,
  textTransform: 'lowercase'
}

const ShowDetails = styled.div``
const showDetailsStyle = {
  textDecoration: 'underline',
  font: 'normal normal medium 13px/22px Marianne',
  color: COLORS.gunMetal,
  cursor: 'pointer'
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
  width: 'inherit',
  display: 'table',
  margin: 0
}

const Field = styled.tr``
const fieldStyle = {
  margin: '5px 5px 5px 0',
  border: 'none',
  background: 'none'
}

const Key = styled.th``
const keyStyle = {
  color: COLORS.slateGray,
  display: 'inline-block',
  margin: 0,
  border: 'none',
  padding: '5px 5px 5px 0',
  background: 'none',
  width: 100,
  fontSize: 13,
  fontWeight: 'normal'
}

const Value = styled.td``
const valueStyle = {
  fontSize: 13,
  color: COLORS.gunMetal,
  margin: 0,
  textAlign: 'left',
  padding: '5px 5px 5px 5px',
  background: 'none',
  border: 'none',
  lineHeight: 'normal',
  fontWeight: 500
}

export default BeaconMalfunctionsDetailsFollowUpNotification
