import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { setAdminRole, setInBackofficeMode } from '../domain/shared_slices/Global'

// TODO Are these types correct? Rename them is they are boolean.
export type BackofficeModeProps = {
  adminRole?: boolean
  inBackofficeMode: boolean
}
export function BackofficeMode({ adminRole = false, inBackofficeMode }: BackofficeModeProps) {
  const dispatch = useDispatch()

  useEffect(() => {
    // TODO Remove once actions are typed
    if (!setInBackofficeMode) {
      return
    }

    dispatch(setInBackofficeMode(inBackofficeMode))
  }, [dispatch, inBackofficeMode])

  useEffect(() => {
    // TODO Remove once actions are typed
    if (!setAdminRole) {
      return
    }

    dispatch(setAdminRole(adminRole))
  }, [dispatch, adminRole])

  return null
}
