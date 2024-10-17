import { useTracking } from '@hooks/useTracking'
import { setUser } from '@sentry/react'
import { isCypress } from '@utils/isCypress'
import { useCallback, useEffect, useMemo } from 'react'
import { type AuthContextProps, useAuth } from 'react-oidc-context'

import { useGetCurrentUserAuthorizationQueryOverride } from './useGetCurrentUserAuthorizationQueryOverride'
import { getOIDCConfig } from '../getOIDCConfig'

import type { UserAccountContextType } from '../../context/UserAccountContext'

const { IS_OIDC_ENABLED } = getOIDCConfig()
const IS_CYPRESS = isCypress()

/**
 * When using Cypress, we stub `useAuth()`
 */
export function useGetUserAccount(): UserAccountContextType | undefined {
  // `| undefined` because it's undefined if the OIDC is disabled which is the case for Cypress tests
  const auth = useAuth() as AuthContextProps | undefined
  const { trackUserId } = useTracking()
  const { data: user } = useGetCurrentUserAuthorizationQueryOverride({ skip: !IS_CYPRESS && !auth?.isAuthenticated })

  useEffect(() => {
    if (auth?.user?.profile?.email) {
      trackUserId(auth.user.profile.email)
      setUser({ email: auth.user.profile.email })
    }
  }, [trackUserId, auth?.user?.profile?.email])

  const logout = useCallback(() => {
    if (!auth) {
      return
    }

    const idTokenHint = auth.user?.id_token

    auth.removeUser()
    auth.signoutRedirect({ id_token_hint: idTokenHint ?? '' })
  }, [auth])

  const userAccount = useMemo(() => {
    if (!user) {
      return undefined
    }

    if (IS_CYPRESS || !IS_OIDC_ENABLED) {
      return {
        email: '',
        isAuthenticated: true,
        isSuperUser: user?.isSuperUser ?? false,
        logout
      }
    }

    return {
      email: auth?.user?.profile?.email,
      isAuthenticated: auth?.isAuthenticated ?? false,
      isSuperUser: user?.isSuperUser ?? false,
      logout
    }
  }, [logout, user, auth?.isAuthenticated, auth?.user?.profile?.email])

  useEffect(
    () =>
      // the `return` is important - addAccessTokenExpired() returns a cleanup function
      auth?.events?.addAccessTokenExpired(() => {
        // eslint-disable-next-line no-console
        console.log('Renewing token...')
        auth?.signinSilent()
      }),
    [auth]
  )

  return userAccount
}
