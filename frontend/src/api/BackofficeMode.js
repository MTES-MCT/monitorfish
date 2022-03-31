import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setAdminRole, setInBackofficeMode } from '../domain/shared_slices/Global'

const BackofficeMode = ({ inBackofficeMode, adminRole }) => {
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
