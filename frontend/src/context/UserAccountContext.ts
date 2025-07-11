import React from 'react'

export type UserAccountContextType = {
  email: undefined | string
  isAuthenticated: boolean
  isSuperUser: boolean
  logout?: () => void
}
export const UserAccountContext = React.createContext<UserAccountContextType>({
  email: undefined,
  isAuthenticated: false,
  isSuperUser: false,
  logout: () => {}
})
