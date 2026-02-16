import { useContext } from 'react'

import { UserAccountContext } from '../../context/UserAccountContext'

export function useGetUserEmail(): string {
  const userAccount = useContext(UserAccountContext)

  return userAccount.email ?? ''
}
