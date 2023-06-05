import { useEffect } from 'react'

import { setIsBackoffice } from '../domain/shared_slices/Global'
import { useMainAppDispatch } from '../hooks/useMainAppDispatch'

export type BackofficeModeProps = {
  isBackoffice?: boolean
}
// TODO Find a better way than a component to initialize these state props (a HOC may be more fit for that?).
export function BackofficeMode({ isBackoffice = false }: BackofficeModeProps) {
  const dispatch = useMainAppDispatch()

  useEffect(() => {
    dispatch(setIsBackoffice(isBackoffice))
  }, [dispatch, isBackoffice])

  return null
}
