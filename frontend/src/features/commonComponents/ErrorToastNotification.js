import { useEffect } from 'react'
import { useToasts } from 'react-toast-notifications'

import { useSelector } from 'react-redux'
import { errorType } from '../../domain/entities/errors'

const ErrorToastNotification = () => {
  const error = useSelector(state => state.global.error)
  const { addToast } = useToasts()

  useEffect(() => {
    if (error) {
      if (error.type && error.type === errorType.INFO_AND_HIDDEN) {
        return
      }

      if (error.type) {
        addToast(error.message.split(':')[0], {
          appearance: error.type,
          autoDismiss: true,
          autoDismissTimeout: 10000
        })
      } else {
        addToast(error.message.split(':')[0], {
          appearance: 'warning',
          autoDismiss: true,
          autoDismissTimeout: 10000
        })
      }
    }
  }, [error])

  return null
}

export default ErrorToastNotification
