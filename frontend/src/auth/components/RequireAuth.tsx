import { Navigate } from 'react-router-dom'
import styled from 'styled-components'

import { UserAccountContext } from '../../context/UserAccountContext'
import { ROUTER_PATHS } from '../../paths'
import { LoadingSpinnerWall } from '../../ui/LoadingSpinnerWall'
import { useGetUserAccount } from '../hooks/useGetUserAccount'

const handleRedirect = (path: string, shouldRedirect: boolean) => {
  if (shouldRedirect) {
    return <Navigate replace to={path} />
  }

  return null
}

export function RequireAuth({ children, redirect = false, requireSuperUser = false }) {
  const { isLoading, userAccount } = useGetUserAccount()
  if (isLoading) {
    return (
      // Not the `LoginBackground`: its image would be downloaded on every launch of the app
      <LoadingWrapper>
        <LoadingSpinnerWall isVesselShowed />
      </LoadingWrapper>
    )
  }

  if (!userAccount?.isAuthenticated) {
    return handleRedirect(ROUTER_PATHS.login, redirect)
  }

  if (requireSuperUser && !userAccount.isSuperUser) {
    return handleRedirect(ROUTER_PATHS.register, redirect)
  }

  return <UserAccountContext.Provider value={userAccount}>{children}</UserAccountContext.Provider>
}

const LoadingWrapper = styled.div`
  background: ${p => p.theme.color.charcoal};
  display: flex;
  height: 100vh;
  width: 100vw;
`
