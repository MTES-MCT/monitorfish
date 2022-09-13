import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { setIsAdmin, setIsBackoffice } from '../domain/shared_slices/Global'

export type BackofficeModeProps = {
  isAdmin?: boolean
  isBackoffice?: boolean
}
// TODO Find a better way than a component to initialize these state props (a HOC may be more fit for that?).
export function BackofficeMode({ isAdmin = false, isBackoffice = false }: BackofficeModeProps) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setIsBackoffice(isBackoffice))
  }, [dispatch, isBackoffice])

  useEffect(() => {
    dispatch(setIsAdmin(isAdmin))
  }, [dispatch, isAdmin])

  return null
}
