import { monitorfishApi } from '@api/api'
import { FrontendApiError } from '@libs/FrontendApiError'
import { parseOrReturn } from '@utils/parseOrReturn'

import { UserLayersSchema } from './schemas/UserLayersSchema'

import type { UserLayers } from './types'

const GET_USER_LAYERS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer vos couches."
const INIT_USER_LAYERS_ERROR_MESSAGE = "Nous n'avons pas pu initialiser vos couches."
const SAVE_USER_LAYERS_ERROR_MESSAGE = "Nous n'avons pas pu sauvegarder vos couches."

export const userLayersApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getUserLayers: builder.query<UserLayers, void>({
      query: () => ({
        method: 'GET',
        url: '/user_layers'
      }),
      transformErrorResponse: response => new FrontendApiError(GET_USER_LAYERS_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: UserLayers) =>
        parseOrReturn<UserLayers>(baseQueryReturnValue, UserLayersSchema, false)
    }),

    initUserLayers: builder.mutation<UserLayers, UserLayers>({
      query: userLayers => ({
        body: userLayers,
        method: 'POST',
        url: '/user_layers/init'
      }),
      transformErrorResponse: response => new FrontendApiError(INIT_USER_LAYERS_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: UserLayers) =>
        parseOrReturn<UserLayers>(baseQueryReturnValue, UserLayersSchema, false)
    }),

    saveUserLayers: builder.mutation<UserLayers, UserLayers>({
      query: userLayers => ({
        body: userLayers,
        method: 'PUT',
        url: '/user_layers'
      }),
      transformErrorResponse: response => new FrontendApiError(SAVE_USER_LAYERS_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: UserLayers) =>
        parseOrReturn<UserLayers>(baseQueryReturnValue, UserLayersSchema, false)
    })
  })
})
