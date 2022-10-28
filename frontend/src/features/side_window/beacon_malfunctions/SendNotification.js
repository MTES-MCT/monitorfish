import { useEffect, useRef, useState } from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { NOTIFICATION_TYPE } from '../../../domain/entities/beaconMalfunction/constants'
import { SelectPicker } from 'rsuite'
import sendNotification from '../../../domain/use_cases/beaconMalfunction/sendNotification'

const SendNotification = ({ beaconMalfunction }) => {
  const dispatch = useDispatch()
  const selectMenuRef = useRef()
  const [isSendingNotification, setIsSendingNotification] = useState('')

  useEffect(() => {
    setIsSendingNotification(beaconMalfunction?.notificationRequested)
  }, [beaconMalfunction])

  useEffect(() => {
    // Target the `select-picker` DOM component
    selectMenuRef.current?.previousSibling.style.setProperty('background', COLORS.charcoal, 'important')
    selectMenuRef.current?.previousSibling.style.setProperty('margin', '2px 10px 10px 0px', 'important')
    // Target the `rs-picker-toggle-value` span DOM component
    const toggleElement = selectMenuRef.current?.previousSibling?.querySelector('.rs-picker-toggle-placeholder')
    if (toggleElement?.style) {
      toggleElement.style.setProperty('color', COLORS.gainsboro, 'important')
      toggleElement.style.setProperty('font-size', 13, 'important')
    }
  }, [])

  return (<>
    <SelectPicker
      container={() => selectMenuRef.current}
      menuStyle={{ position: 'absolute', marginTop: 275, marginLeft: 40}}
      style={sendNotificationSelectStyle}
      searchable={false}
      cleanable={false}
      value={null}
      placeholder={'Envoyer un message'}
      onChange={status => dispatch(sendNotification(beaconMalfunction.id, status))
        .then(() => setIsSendingNotification(status))}
      data={Object.keys(NOTIFICATION_TYPE)
        .map(type => ({ label: NOTIFICATION_TYPE[type].followUpMessage, value: type }))}
    />
    <div ref={selectMenuRef} />
    {
      isSendingNotification
        ? <SendingNotification
          data-cy={'side-window-beacon-malfunctions-sending-notification'}
          style={sendingNotificationStyle}
        >
          <span className={'loader'}/>
          En attente d’envoi  {NOTIFICATION_TYPE[isSendingNotification].preposition}{' '}
          {NOTIFICATION_TYPE[isSendingNotification].followUpMessage}
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
