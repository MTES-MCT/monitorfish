import { AUTHORIZATION_HEADER, CORRELATION_HEADER } from '@api/api'
import { isCypress } from '@utils/isCypress'
import { sha256 } from '@utils/sha256'
import { getOIDCConfig } from 'auth/getOIDCConfig'
import { getOIDCUser } from 'auth/getOIDCUser'
import { useCallback, useEffect, useState } from 'react'

const { IS_OIDC_ENABLED } = getOIDCConfig()

const IS_CYPRESS = isCypress()

/**
 * Hook to get API request headers required for OIDC authentication.
 *
 * If the returned headers are `undefined`,
 * it means that you need to wait for the headers to be updated before making your request.
 * This is because the headers are updated asynchronously (`await sha256(nextToken)`).
 */
export function useAuthRequestHeaders(): Record<string, string> | undefined {
  const [headers, setHeaders] = useState<Record<string, string> | undefined>(undefined)

  const user = getOIDCUser()
  const token = user?.access_token

  const updateHeaders = useCallback(async (nextToken: string | undefined) => {
    if (!IS_OIDC_ENABLED || IS_CYPRESS) {
      setHeaders({})

      return
    }
    if (!nextToken) {
      setHeaders(undefined)

      return
    }

    const nextHeaders = {
      [AUTHORIZATION_HEADER]: `Bearer ${nextToken}`,
      ...(crypto?.subtle ? { [CORRELATION_HEADER]: await sha256(nextToken) } : {})
    }

    setHeaders(nextHeaders)
  }, [])

  useEffect(() => {
    updateHeaders(token)
  }, [token, updateHeaders])

  return headers
}
