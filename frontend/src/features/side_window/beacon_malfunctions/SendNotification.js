import React, { useEffect, useRef, useState } from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { beaconMalfunctionNotificationType } from '../../../domain/entities/beaconMalfunction'
import { SelectPicker } from 'rsuite'
import { useClickOutsideWhenOpenedWithinRef } from '../../../hooks/useClickOutsideWhenOpenedWithinRef'
import sendNotification from '../../../domain/use_cases/beaconMalfunction/sendNotification'

const SendNotification = ({ beaconMalfunction, baseRef }) => {
  const dispatch = useDispatch()
  const selectMenuRef = useRef()
  const [isSendingNotification, setIsSendingNotification] = useState('')
  const [sendNotificationSelectIsOpened, setSendNotificationSelectIsOpened] = useState(false)
  const clickedOutsideSendNotificationMenu = useClickOutsideWhenOpenedWithinRef(selectMenuRef, sendNotificationSelectIsOpened, baseRef)

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
    selectMenuRef.current?.previousSibling.firstChild.firstChild.style.setProperty('color', COLORS.gainsboro, 'important')
    selectMenuRef.current?.previousSibling.firstChild.firstChild.style.setProperty('font-size', '13px', 'important')
  }, [])

  return (<>
    <SelectPicker
      container={() => selectMenuRef.current}
      menuStyle={{ position: 'absolute', marginTop: 310, marginLeft: 40 }}
      style={sendNotificationSelectStyle}
      searchable={false}
      cleanable={false}
      open={sendNotificationSelectIsOpened}
      value={null}
      onClick={() => setSendNotificationSelectIsOpened(true)}
      placeholder={'Envoyer un message'}
      onChange={status => dispatch(sendNotification(beaconMalfunction.id, status))
        .then(() => setSendNotificationSelectIsOpened(false))
        .then(() => setIsSendingNotification(status))}
      data={Object.keys(beaconMalfunctionNotificationType)
        .map(type => ({ label: beaconMalfunctionNotificationType[type].followUpMessage, value: type }))}
    />
    <div ref={selectMenuRef} />
    {
      isSendingNotification
        ? <SendingNotification
          data-cy={'side-window-beacon-malfunctions-sending-notification'}
          style={sendingNotificationStyle}
        >
          <span className={'loader'}/>
          En attente d’envoi  {beaconMalfunctionNotificationType[isSendingNotification].preposition}{' '}
          {beaconMalfunctionNotificationType[isSendingNotification].followUpMessage}
        </SendingNotification>
        : null
    }
  </>)
}

const SendingNotification = styled.div``
const sendingNotificationStyle = {
  color: COLORS.slateGray,
  fontSize: 11,
  textTransform: 'lowercase',
  marginTop: -8,
  maxWidth: 290,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'flex'
}

const sendNotificationSelectStyle = {
  width: '90px'
}

export default SendNotification
