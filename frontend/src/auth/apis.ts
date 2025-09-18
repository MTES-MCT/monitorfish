import { monitorfishApi } from '@api/api'
import { BackendApi, type Meta } from '@api/BackendApi.types'
import { HttpStatusCode } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'

import type { UserAuthorization } from './types'

import ErrorCode = BackendApi.ErrorCode

const ERROR_AUTHENTICATION_REQUIRED = 'Authentification requise'
const ERROR_TOKEN_EXPIRED = "Jeton d'authentification expiré"
const ERROR_AUTHENTICATION_FAILED = "Erreur d'authentification"

export const authorizationAPI = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getCurrentUserAuthorization: builder.query<UserAuthorization, void>({
      keepUnusedDataFor: 0,
      query: () => '/authorization/current',
      transformErrorResponse: (response, meta: Meta) => {
        const authenticateResponse = meta?.response?.headers.get('WWW-Authenticate')
        if (authenticateResponse?.includes('authentication is required')) {
          throw new FrontendApiError(ERROR_AUTHENTICATION_REQUIRED, {
            path: response.path,
            requestData: response.requestData,
            responseData: {
              code: ErrorCode.AUTHENTICATION_REQUIRED,
              data: { isSuperUser: false },
              type: ErrorCode.AUTHENTICATION_REQUIRED
            },
            status: HttpStatusCode.FORBIDDEN
          })
        }
        if (authenticateResponse?.includes('expired')) {
          throw new FrontendApiError(ERROR_TOKEN_EXPIRED, {
            path: response.path,
            requestData: response.requestData,
            responseData: {
              code: ErrorCode.AUTHENTICATION_REQUIRED,
              data: { isSuperUser: false },
              type: ErrorCode.AUTHENTICATION_REQUIRED
            },
            status: HttpStatusCode.FORBIDDEN
          })
        }

        throw new FrontendApiError(ERROR_AUTHENTICATION_FAILED, {
          path: response.path,
          requestData: response.requestData,
          responseData: {
            code: ErrorCode.AUTHENTICATION_REQUIRED,
            data: { isSuperUser: false },
            type: ErrorCode.AUTHENTICATION_REQUIRED
          },
          status: HttpStatusCode.FORBIDDEN
        })
      }
    })
  })
})

export const {
  endpoints: { getCurrentUserAuthorization },
  useGetCurrentUserAuthorizationQuery
} = authorizationAPI
