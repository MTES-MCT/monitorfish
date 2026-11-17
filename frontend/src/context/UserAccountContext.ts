import React from 'react'

export type UserAccountContextType = {
  email: undefined | string
  isAdministrator: boolean
  isAuthenticated: boolean
  isSuperUser: boolean
  logout?: () => void
}
export const UserAccountContext = React.createContext<UserAccountContextType>({
  email: undefined,
  isAdministrator: false,
  isAuthenticated: false,
  isSuperUser: false,
  logout: () => {}
})
