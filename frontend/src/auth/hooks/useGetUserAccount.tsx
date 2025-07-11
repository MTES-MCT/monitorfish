import { useTracking } from '@hooks/useTracking'
import { setUser } from '@sentry/react'
import { useEffect, useMemo } from 'react'

import { useGetCurrentUserAuthorizationQuery } from '../apis'

import type { UserAccountContextType } from '../../context/UserAccountContext'

export function useGetUserAccount(): { isLoading: boolean; userAccount: UserAccountContextType | undefined } {
  const { trackUserId } = useTracking()
  const oidcEnabled = import.meta.env.FRONTEND_OIDC_ENABLED
  const { data: user, isLoading } = useGetCurrentUserAuthorizationQuery(undefined, {
    skip: !oidcEnabled
  })

  useEffect(() => {
    if (user) {
      trackUserId(user.email)
      setUser({ email: user.email })
    }
  }, [trackUserId, user])

  const onLogout = () => {
    window.location.href = '/logout'
  }

  const userAccount = useMemo(() => {
    if (!oidcEnabled) {
      return {
        email: '',
        isAuthenticated: true,
        isSuperUser: true
      }
    }

    if (!user) {
      return undefined
    }

    return {
      email: user.email,
      isAuthenticated: true,
      isSuperUser: user.isSuperUser,
      logout: onLogout
    }
  }, [onLogout, oidcEnabled, user])

  return { isLoading, userAccount }
}
