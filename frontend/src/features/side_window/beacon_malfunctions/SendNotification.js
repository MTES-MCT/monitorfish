import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { SelectPicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { beaconMalfunctionNotificationType } from '../../../domain/entities/beaconMalfunction'
import sendNotification from '../../../domain/use_cases/beaconMalfunction/sendNotification'
import { useClickOutsideWhenOpenedWithinRef } from '../../../hooks/useClickOutsideWhenOpenedWithinRef'

function SendNotification({ baseRef, beaconMalfunction }) {
  const dispatch = useDispatch()
  const selectMenuRef = useRef()
  const [isSendingNotification, setIsSendingNotification] = useState('')
  const [sendNotificationSelectIsOpened, setSendNotificationSelectIsOpened] = useState(false)
  const clickedOutsideSendNotificationMenu = useClickOutsideWhenOpenedWithinRef(
    selectMenuRef,
    sendNotificationSelectIsOpened,
    baseRef,
  )

  useEffect(() => {
    if (clickedOutsideSendNotificationMenu) {
      setSendNotificationSelectIsOpened(false)
    }
  }, [clickedOutsideSendNotificationMenu])

  useEffect(() => {
    setIsSendingNotification(beaconMalfunction?.notificationRequested)
  }, [beaconMalfunction])

  useEffect(() => {
    // Target the `select-picker` DOM component
    selectMenuRef.current?.previousSibling.style.setProperty('background', COLORS.charcoal, 'important')
    selectMenuRef.current?.previousSibling.style.setProperty('margin', '2px 10px 10px 0px', 'important')
    // Target the `rs-picker-toggle-value` span DOM component
    selectMenuRef.current?.previousSibling.firstChild.firstChild.style.setProperty(
      'color',
      COLORS.gainsboro,
      'important',
    )
    selectMenuRef.current?.previousSibling.firstChild.firstChild.style.setProperty('font-size', '13px', 'important')
  }, [])

  return (
    <>
      <SelectPicker
        cleanable={false}
        container={() => selectMenuRef.current}
        data={Object.keys(beaconMalfunctionNotificationType).map(type => ({
          label: beaconMalfunctionNotificationType[type].followUpMessage,
          value: type,
        }))}
        menuStyle={{ marginLeft: 40, marginTop: 310, position: 'absolute' }}
        onChange={status =>
          dispatch(sendNotification(beaconMalfunction.id, status))
            .then(() => setSendNotificationSelectIsOpened(false))
            .then(() => setIsSendingNotification(status))
        }
        onClick={() => setSendNotificationSelectIsOpened(true)}
        open={sendNotificationSelectIsOpened}
        placeholder="Envoyer un message"
        searchable={false}
        style={sendNotificationSelectStyle}
        value={null}
      />
      <div ref={selectMenuRef} />
      {isSendingNotification ? (
        <SendingNotification
          data-cy="side-window-beacon-malfunctions-sending-notification"
          style={sendingNotificationStyle}
        >
          <span className="loader" />
          Envoi en cours {beaconMalfunctionNotificationType[isSendingNotification].preposition}{' '}
          {beaconMalfunctionNotificationType[isSendingNotification].followUpMessage}
        </SendingNotification>
      ) : null}
    </>
  )
}

const SendingNotification = styled.div``
const sendingNotificationStyle = {
  color: COLORS.slateGray,
  display: 'flex',
  fontSize: 11,
  marginTop: -8,
  maxWidth: 290,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textTransform: 'lowercase',
}

const sendNotificationSelectStyle = {
  width: '90px',
}

export default SendNotification
