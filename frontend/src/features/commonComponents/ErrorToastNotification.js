import { useEffect } from 'react'
import { toast } from 'react-toastify'

import { useSelector } from 'react-redux'
import { errorType } from '../../domain/entities/errors'

const ErrorToastNotification = () => {
  const error = useSelector(state => state.global.error)

  useEffect(() => {
    if (error && error.message) {
      if (error.type && error.type === errorType.INFO_AND_HIDDEN) {
        return
      }

      if (error.type) {
        toast.error(error.message.split(':')[0], {
          autoClose: 10000,
          position: 'bottom-right'
        })
      } else {
        toast.warning(error.message.split(':')[0], {
          autoClose: 10000,
          position: 'bottom-right'
        })
      }
    }
  }, [error])

  return null
}

export default ErrorToastNotification
