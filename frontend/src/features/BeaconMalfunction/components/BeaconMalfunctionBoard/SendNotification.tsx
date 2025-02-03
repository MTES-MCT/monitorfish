import { useGetForeignFmcsQuery } from '@api/foreignFmc'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { type Option, Select, THEME } from '@mtes-mct/monitor-ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SelectPicker } from 'rsuite'
import styled from 'styled-components'

import { NOTIFICATION_TYPE, SELECTABLE_NOTIFICATION_TYPES } from '../../constants'
import { sendNotification } from '../../useCases/sendNotification'

import type { CSSProperties } from 'react'

export function SendNotification({ beaconMalfunction }) {
  const dispatch = useMainAppDispatch()
  const getForeignFmcsApiQuery = useGetForeignFmcsQuery()
  const selectMenuRef = useRef<HTMLDivElement>()
  const [isSendingNotification, setIsSendingNotification] = useState<string | null>('')
  const [isShowingForeignFmcList, setIsShowingForeignFmcList] = useState<boolean>(false)

  const foreignFmcsAsOptions: Option[] = useMemo(() => {
    if (!getForeignFmcsApiQuery.data) {
      return []
    }

    return getForeignFmcsApiQuery.data.map(fmc => ({
      label: `${fmc.countryName} - ${fmc.countryCodeIso3}`,
      value: fmc.countryCodeIso3
    }))
  }, [getForeignFmcsApiQuery.data])

  useEffect(() => {
    setIsSendingNotification(beaconMalfunction?.notificationRequested)
  }, [beaconMalfunction])

  useEffect(() => {
    // Target the `select-picker` DOM component
    if (selectMenuRef.current?.previousSibling) {
      ;(selectMenuRef.current.previousSibling as HTMLElement).style.setProperty(
        'background',
        THEME.color.charcoal,
        'important'
      )
      ;(selectMenuRef.current.previousSibling as HTMLElement).style.setProperty(
        'margin',
        '2px 10px 5px 0px',
        'important'
      )

      // Target the `rs-picker-toggle-value` span DOM component
      const toggleElement = (selectMenuRef.current.previousSibling as HTMLDivElement).querySelector<HTMLElement>(
        '.rs-picker-toggle-placeholder'
      )
      if (toggleElement?.style) {
        toggleElement.style.setProperty('color', THEME.color.gainsboro, 'important')
        toggleElement.style.setProperty('font-size', '13', 'important')
      }
    }
  }, [])

  function onSelectNotification(status: string | null) {
    // Key of NOTIFICATION_TYPE.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC object
    if (status === 'MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC') {
      setIsShowingForeignFmcList(true)

      return
    }

    setIsShowingForeignFmcList(false)
    dispatch(sendNotification(beaconMalfunction.id, status))?.then(notificationType => {
      if (!notificationType) {
        return
      }

      setIsSendingNotification(notificationType)
    })
  }

  function onSelectForeignFmc(foreignFmcCode: string | undefined) {
    dispatch(
      sendNotification(
        beaconMalfunction.id,
        // Key of NOTIFICATION_TYPE.MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC object
        'MALFUNCTION_NOTIFICATION_TO_FOREIGN_FMC',
        foreignFmcCode
      )
    )?.then(notificationType => {
      if (!notificationType) {
        return
      }

      setIsSendingNotification(notificationType)
      setIsShowingForeignFmcList(false)
    })
  }

  return (
    <>
      <SelectPicker
        cleanable={false}
        container={() => selectMenuRef.current as any}
        data={SELECTABLE_NOTIFICATION_TYPES.map(type => ({
          label: NOTIFICATION_TYPE[type].followUpMessage,
          value: type
        }))}
        menuStyle={{ marginLeft: 40, marginTop: 275, position: 'absolute' }}
        onChange={status => onSelectNotification(status)}
        placeholder="Envoyer un message"
        searchable={false}
        style={sendNotificationSelectStyle}
        value={null}
      />
      <div ref={selectMenuRef as any} />
      {isShowingForeignFmcList && (
        <StyledForeignFmcSelect
          cleanable={false}
          label="Choisir la nationalité du FMC"
          name="foreign-fmc-select"
          onChange={foreignFmcCode => onSelectForeignFmc(foreignFmcCode as string | undefined)}
          options={foreignFmcsAsOptions}
          searchable
          style={{ marginLeft: 0 }}
          value={undefined}
        />
      )}
      {isSendingNotification && (
        <SendingNotification data-cy="side-window-beacon-malfunctions-sending-notification">
          <span className="loader" />
          En attente d’envoi {NOTIFICATION_TYPE[isSendingNotification].preposition}{' '}
          {NOTIFICATION_TYPE[isSendingNotification].followUpMessage}
        </SendingNotification>
      )}
    </>
  )
}

const StyledForeignFmcSelect = styled(Select)`
  .rs-picker-select {
    margin: 0 0 10px 0 !important;
  }
`

const SendingNotification = styled.div`
  color: ${p => p.theme.color.slateGray};
  display: flex;
  font-size: 11px;
  margin-top: 0px;
  max-width: 290px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: lowercase;
`

const sendNotificationSelectStyle: CSSProperties = {
  width: '90px'
}
