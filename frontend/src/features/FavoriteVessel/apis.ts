import { monitorfishApi } from '@api/api'
import { RtkCacheTagType } from '@api/constants'
import { FavoriteVesselVesselIdentitySchema } from '@features/FavoriteVessel/schemas/FavoriteVesselVesselIdentitySchema'
import { FrontendApiError } from '@libs/FrontendApiError'
import { parseOrReturn } from '@utils/parseOrReturn'

import type { FavoriteVesselVesselIdentity } from './types'

const SAVE_FAVORITE_ERROR_MESSAGE = "Nous n'avons pas pu sauvegarder le navire suivi."
const DELETE_FAVORITE_ERROR_MESSAGE = "Nous n'avons pas pu supprimer le navire suivi."
const INIT_FAVORITE_ERROR_MESSAGE = "Nous n'avons pas pu initialiser les navires suivis."
const GET_FAVORITE_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les navires suivis."

export const favoriteVesselsApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    deleteFavoriteVessel: builder.mutation<FavoriteVesselVesselIdentity[], FavoriteVesselVesselIdentity>({
      invalidatesTags: [{ type: RtkCacheTagType.FavoriteVessels }],
      query: deletedVesselFormData => ({
        body: parseOrReturn<FavoriteVesselVesselIdentity>(
          deletedVesselFormData,
          FavoriteVesselVesselIdentitySchema,
          false
        ),
        method: 'DELETE',
        url: '/favorite_vessels'
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_FAVORITE_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: FavoriteVesselVesselIdentity[]) =>
        parseOrReturn<FavoriteVesselVesselIdentity>(baseQueryReturnValue, FavoriteVesselVesselIdentitySchema, true)
    }),

    getFavoriteVessels: builder.query<FavoriteVesselVesselIdentity[], void>({
      providesTags: () => [{ type: RtkCacheTagType.FavoriteVessels }],
      query: () => ({
        method: 'GET',
        url: '/favorite_vessels'
      }),
      transformErrorResponse: response => new FrontendApiError(GET_FAVORITE_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: FavoriteVesselVesselIdentity[]) =>
        parseOrReturn<FavoriteVesselVesselIdentity>(baseQueryReturnValue, FavoriteVesselVesselIdentitySchema, true)
    }),

    initFavoriteVessel: builder.mutation<FavoriteVesselVesselIdentity[], FavoriteVesselVesselIdentity[]>({
      invalidatesTags: [{ type: RtkCacheTagType.FavoriteVessels }],
      query: vesselsFormData => ({
        body: parseOrReturn<FavoriteVesselVesselIdentity>(vesselsFormData, FavoriteVesselVesselIdentitySchema, true),
        method: 'POST',
        url: '/favorite_vessels/init'
      }),
      transformErrorResponse: response => new FrontendApiError(INIT_FAVORITE_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: FavoriteVesselVesselIdentity[]) =>
        parseOrReturn<FavoriteVesselVesselIdentity>(baseQueryReturnValue, FavoriteVesselVesselIdentitySchema, true)
    }),

    saveFavoriteVessel: builder.mutation<FavoriteVesselVesselIdentity[], FavoriteVesselVesselIdentity>({
      invalidatesTags: [{ type: RtkCacheTagType.FavoriteVessels }],
      query: savedVesselFormData => ({
        body: parseOrReturn<FavoriteVesselVesselIdentity>(
          savedVesselFormData,
          FavoriteVesselVesselIdentitySchema,
          false
        ),
        method: 'PUT',
        url: '/favorite_vessels'
      }),
      transformErrorResponse: response => new FrontendApiError(SAVE_FAVORITE_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: FavoriteVesselVesselIdentity[]) =>
        parseOrReturn<FavoriteVesselVesselIdentity>(baseQueryReturnValue, FavoriteVesselVesselIdentitySchema, true)
    })
  })
})

export const { useDeleteFavoriteVesselMutation, useGetFavoriteVesselsQuery, useSaveFavoriteVesselMutation } =
  favoriteVesselsApi
