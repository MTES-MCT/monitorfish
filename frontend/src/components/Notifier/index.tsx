import { THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useState } from 'react'
import { ToastContainer, toast, type ToastContainerProps } from 'react-toastify'
import styled from 'styled-components'

import { NotifierEvent } from './NotifiierEvent'
import { Dialog } from '../Dialog'

export { NotifierEvent as NotificationEvent }

export type NotifierProps = {
  isSideWindow?: boolean
}
export function Notifier({ isSideWindow = false }: NotifierProps) {
  const [dialogMessage, setDialogMessage] = useState<string | undefined>(undefined)

  const closeDialog = useCallback(() => {
    setDialogMessage(undefined)
  }, [])

  const push = useCallback(
    (event: NotifierEvent) => {
      if (event.detail.isSideWindowError !== isSideWindow) {
        return
      }

      if (event.detail.isDialogError) {
        setDialogMessage(event.detail.message)

        return
      }

      toast(event.detail.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
        type: event.detail.type
      })
    },

    // We don't want to depend on `isSideWindow` since it should never change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    window.document.addEventListener<any>('NOTIFIER_EVENT', push)

    return () => {
      window.document.removeEventListener<any>('NOTIFIER_EVENT', push)
    }
  }, [push])

  useEffect(() => {
    window.document.addEventListener<any>('NOTIFIER_EVENT', push)

    return () => {
      window.document.removeEventListener<any>('NOTIFIER_EVENT', push)
    }
  }, [push])

  return (
    <>
      {dialogMessage && (
        <Dialog
          color={THEME.color.maximumRed}
          message={dialogMessage}
          onClose={closeDialog}
          title="Action impossible"
          titleBackgroundColor={THEME.color.maximumRed}
        />
      )}

      <StyledToastContainer
        // We may wish to let the user be able to copy the notification message
        // which is not easy to achieve when the notification is draggable
        draggable={false}
      />
    </>
  )
}

// We need to retype `ToastContainer` manually because `styled-components` mess up with the `children` prop
const StyledToastContainer = styled(ToastContainer as any)`` as unknown as React.ForwardRefExoticComponent<
  ToastContainerProps & React.RefAttributes<HTMLDivElement>
>
