import { noop } from 'lodash'
import { useEffect, useMemo, useState } from 'react'

import { getCurrentUserAuthorization } from '../../domain/use_cases/authorization/getCurrentUserAuthorization'

import type { UserAccountContextType } from '../../context/UserAccountContext'
import type { UserAuthorization } from '../../domain/entities/authorization/types'

export function useCustomAuthWithoutOicd(): {
  isAuthorized: boolean
  isLoading: boolean
  userAccount: UserAccountContextType | undefined
} {
  const [userAuthorization, setUserAuthorization] = useState<UserAuthorization | undefined>(undefined)

  useEffect(() => {
    setTimeout(async () => {
      const nextUserAuthorization = await getCurrentUserAuthorization()

      setUserAuthorization(nextUserAuthorization)
    }, 250)
  }, [])

  const userAccount = useMemo(
    () => ({
      email: 'bob@see.org',
      isSuperUser: userAuthorization?.isSuperUser ?? false,
      logout: noop
    }),
    [userAuthorization]
  )

  if (!userAuthorization || userAuthorization?.isLogged === undefined) {
    return { isAuthorized: false, isLoading: true, userAccount: undefined }
  }

  return { isAuthorized: true, isLoading: false, userAccount }
}
