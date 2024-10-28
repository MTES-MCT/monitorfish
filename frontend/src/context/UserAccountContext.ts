import React from 'react'

export type UserAccountContextType = {
  email: undefined | string
  isSuperUser: boolean
  logout: () => void
}
export const UserAccountContext = React.createContext<UserAccountContextType>({
  email: undefined,
  isSuperUser: false,
  logout: () => {}
})
