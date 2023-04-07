import { useEffect, useRef, useState } from 'react'
import { SelectPicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { NOTIFICATION_TYPE } from '../../../domain/entities/beaconMalfunction/constants'
import sendNotification from '../../../domain/use_cases/beaconMalfunction/sendNotification'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'

import type { CSSProperties } from 'react'

export function SendNotification({ beaconMalfunction }) {
  const dispatch = useMainAppDispatch()
  const selectMenuRef = useRef<HTMLDivElement>()
  const [isSendingNotification, setIsSendingNotification] = useState<string | null>('')

  useEffect(() => {
    setIsSendingNotification(beaconMalfunction?.notificationRequested)
  }, [beaconMalfunction])

  useEffect(() => {
    // Target the `select-picker` DOM component
    if (selectMenuRef.current?.previousSibling) {
      ;(selectMenuRef.current.previousSibling as HTMLElement).style.setProperty(
        'background',
        COLORS.charcoal,
        'important'
      )
      ;(selectMenuRef.current.previousSibling as HTMLElement).style.setProperty(
        'margin',
        '2px 10px 10px 0px',
        'important'
      )

      // Target the `rs-picker-toggle-value` span DOM component
      const toggleElement = (selectMenuRef.current.previousSibling as HTMLDivElement).querySelector<HTMLElement>(
        '.rs-picker-toggle-placeholder'
      )
      if (toggleElement?.style) {
        toggleElement.style.setProperty('color', COLORS.gainsboro, 'important')
        toggleElement.style.setProperty('font-size', '13', 'important')
      }
    }
  }, [])

  return (
    <>
      <SelectPicker
        cleanable={false}
        container={() => selectMenuRef.current as any}
        data={Object.keys(NOTIFICATION_TYPE).map(type => ({
          label: NOTIFICATION_TYPE[type].followUpMessage,
          value: type
        }))}
        menuStyle={{ marginLeft: 40, marginTop: 275, position: 'absolute' }}
        onChange={status =>
          dispatch(sendNotification(beaconMalfunction.id, status)).then(() => setIsSendingNotification(status))
        }
        placeholder="Envoyer un message"
        searchable={false}
        style={sendNotificationSelectStyle}
        value={null}
      />
      <div ref={selectMenuRef as any} />
      {isSendingNotification ? (
        <SendingNotification
          data-cy="side-window-beacon-malfunctions-sending-notification"
          style={sendingNotificationStyle}
        >
          <span className="loader" />
          En attente d’envoi {NOTIFICATION_TYPE[isSendingNotification].preposition}{' '}
          {NOTIFICATION_TYPE[isSendingNotification].followUpMessage}
        </SendingNotification>
      ) : null}
    </>
  )
}

const SendingNotification = styled.div``
const sendingNotificationStyle: CSSProperties = {
  color: COLORS.slateGray,
  display: 'flex',
  fontSize: 11,
  marginTop: -8,
  maxWidth: 290,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textTransform: 'lowercase'
}

const sendNotificationSelectStyle: CSSProperties = {
  width: '90px'
}
