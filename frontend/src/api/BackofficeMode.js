import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setInBackofficeMode } from '../domain/shared_slices/Global'

const BackofficeMode = ({ inBackofficeMode }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setInBackofficeMode(inBackofficeMode))
  }, [inBackofficeMode])

  return null
}

export default BackofficeMode
