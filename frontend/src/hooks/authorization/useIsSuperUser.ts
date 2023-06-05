import { useContext } from 'react'

import { AuthorizationContext } from '../../context/AuthorizationContext'

export function useIsSuperUser(): boolean {
  const isSuperUser = useContext(AuthorizationContext)

  return isSuperUser
}
