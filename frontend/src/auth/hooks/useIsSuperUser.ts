import { useContext } from 'react'

import { UserAccountContext } from '../../context/UserAccountContext'

export function useIsSuperUser(): boolean {
  const userAccount = useContext(UserAccountContext)

  return userAccount.isSuperUser
}
