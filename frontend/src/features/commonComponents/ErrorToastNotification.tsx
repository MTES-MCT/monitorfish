import { useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'

import { ErrorType } from '../../domain/entities/errors'
import { useMainAppSelector } from '../../hooks/useMainAppSelector'

import type { ToastOptions } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

export function ErrorToastNotification() {
  // TODO Type global.error
  const error:
    | (Error & {
        type: ErrorType
      })
    | null = useMainAppSelector(state => state.global.error)

  useEffect(() => {
    if (!error || (error.type && error.type === ErrorType.INFO_AND_HIDDEN)) {
      return
    }

    const toastOptions: ToastOptions = {
      autoClose: 3000,
      position: 'bottom-right'
    }

    if (!error.type) {
      toast.error(error.message, toastOptions)

      return
    }

    const toastMessage = error.message.split(':')[0]

    switch (error.type) {
      case ErrorType.INFO:
        toast.info(toastMessage, toastOptions)
        break

      case ErrorType.WARNING:
        toast.warn(toastMessage, toastOptions)
        break

      default:
        // eslint-disable-next-line no-console
        console.debug(toastMessage)
    }
  }, [error])

  return <ToastContainer />
}
