import { Navigate } from 'react-router-dom'

import { LoginBackground } from './Login'
import { UserAccountContext } from '../../context/UserAccountContext'
import { ROUTER_PATHS } from '../../paths'
import { LoadingSpinnerWall } from '../../ui/LoadingSpinnerWall'
import { useGetUserAccount } from '../hooks/useGetUserAccount'

export function RequireAuth({ children, redirect = false, requireSuperUser = false }) {
  const { isLoading, userAccount } = useGetUserAccount()
  if (isLoading) {
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

  if (!userAccount?.isAuthenticated) {
    return handleRedirect(ROUTER_PATHS.login, redirect)
  }

  if (requireSuperUser && !userAccount.isSuperUser) {
    return handleRedirect(ROUTER_PATHS.register, redirect)
  }

  return <UserAccountContext.Provider value={userAccount}>{children}</UserAccountContext.Provider>
}
