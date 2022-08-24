import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { setAdminRole, setInBackofficeMode } from '../domain/shared_slices/Global'

function BackofficeMode({ adminRole, inBackofficeMode }) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setInBackofficeMode(inBackofficeMode))
  }, [inBackofficeMode])

  useEffect(() => {
    dispatch(setAdminRole(adminRole))
  }, [adminRole])

  return null
}

export default BackofficeMode
