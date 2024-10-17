import { Navigate } from 'react-router-dom'

import { LoginBackground } from './Login'
import { UserAccountContext } from '../../context/UserAccountContext'
import { paths } from '../../paths'
import { LoadingSpinnerWall } from '../../ui/LoadingSpinnerWall'
import { useGetUserAccount } from '../hooks/useGetUserAccount'

export function RequireAuth({ children, redirect = false, requireSuperUser = false }) {
  const userAccount = useGetUserAccount()

  if (!userAccount) {
    return (
      <LoginBackground>
        <LoadingSpinnerWall isVesselShowed />
      </LoginBackground>
    )
  }

  const handleRedirect = (path: string, shouldRedirect: boolean) => {
    if (shouldRedirect) {
      return <Navigate replace to={path} />
    }

    return null
  }

  if (!userAccount.isAuthenticated) {
    return handleRedirect(paths.login, redirect)
  }

  if (requireSuperUser && !userAccount.isSuperUser) {
    return handleRedirect(paths.register, redirect)
  }

  return <UserAccountContext.Provider value={userAccount}>{children}</UserAccountContext.Provider>
}
