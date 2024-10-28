import { useTracking } from '@hooks/useTracking'
import { setUser } from '@sentry/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { hasAuthParams, useAuth, type AuthContextProps } from 'react-oidc-context'

import { getCurrentUserAuthorization } from '../../domain/use_cases/authorization/getCurrentUserAuthorization'

import type { UserAccountContextType } from '../../context/UserAccountContext'
import type { UserAuthorization } from '../../domain/entities/authorization/types'

export function useCustomAuth(): {
  isAuthorized: boolean
  isLoading: boolean
  userAccount: UserAccountContextType | undefined
} {
  // `| undefined` because it's undefined if the OIDC is disabled which is the case for Cypress tests
  const auth = useAuth() as AuthContextProps | undefined
  const { trackUserId } = useTracking()
  const [userAuthorization, setUserAuthorization] = useState<UserAuthorization | undefined>(undefined)

  useEffect(() => {
    setTimeout(async () => {
      const nextUserAuthorization = await getCurrentUserAuthorization()

      setUserAuthorization(nextUserAuthorization)
    }, 500)
  }, [])

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
    auth.removeUser()
    auth.signoutRedirect({ id_token_hint: idTokenHint ?? '' })
  }, [auth])

  const userAccount = useMemo(
    () => ({
      email: auth?.user?.profile?.email,
      isSuperUser: userAuthorization?.isSuperUser ?? false,
      logout
    }),
    [logout, userAuthorization, auth?.user?.profile?.email]
  )

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

  useEffect(() => {
    if (!auth) {
      return
    }

    // automatically sign-in
    if (!hasAuthParams() && !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading) {
      // eslint-disable-next-line no-console
      console.log('Redirect after Cerbère sign-in.')
      auth.signinRedirect()

      return
    }

    if (!auth.isLoading && auth.isAuthenticated && userAuthorization?.mustReload) {
      // eslint-disable-next-line no-console
      console.log('Re-trying to login with the latest token...')

      setTimeout(async () => {
        const nextUserAuthorization = await getCurrentUserAuthorization()

        setUserAuthorization(nextUserAuthorization)
      }, 500)
    }
  }, [
    auth,
    auth?.isAuthenticated,
    auth?.activeNavigator,
    auth?.isLoading,
    auth?.signinRedirect,
    userAuthorization?.mustReload
  ])

  if (!userAuthorization || userAuthorization?.isLogged === undefined) {
    return { isAuthorized: false, isLoading: true, userAccount: undefined }
  }

  if (auth && !auth.isLoading && !auth.isAuthenticated) {
    return { isAuthorized: false, isLoading: false, userAccount: undefined }
  }

  return { isAuthorized: true, isLoading: false, userAccount }
}
