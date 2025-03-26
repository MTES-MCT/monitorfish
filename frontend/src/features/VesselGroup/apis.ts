import { monitorfishApi } from '@api/api'
import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'

import type { CreateOrUpdateDynamicVesselGroup, DynamicVesselGroup } from '@features/VesselGroup/types'

const CREATE_VESSEL_GROUPS_ERROR_MESSAGE = "Nous n'avons pas pu créer le groupe de navires."
const GET_VESSELS_GROUPS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les groupes de navires."
const DELETE_VESSEL_GROUP_ERROR_MESSAGE = "Nous n'avons pas pu supprimer le groupe de navires."

export const vesselGroupApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    createOrUpdateDynamicVesselGroup: builder.mutation<DynamicVesselGroup, CreateOrUpdateDynamicVesselGroup>({
      invalidatesTags: () => [{ type: RtkCacheTagType.VesselGroups }],
      query: nextVesselGroupData => ({
        body: nextVesselGroupData,
        method: 'POST',
        url: `vessel_groups`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_VESSEL_GROUPS_ERROR_MESSAGE, response)
    }),
    deleteVesselGroup: builder.mutation<void, number>({
      invalidatesTags: () => [{ type: RtkCacheTagType.VesselGroups }],
      query: id => ({
        method: 'DELETE',
        url: `/vessel_groups/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_VESSEL_GROUP_ERROR_MESSAGE, response)
    }),
    getAllVesselGroups: builder.query<DynamicVesselGroup[], void>({
      providesTags: () => [{ type: RtkCacheTagType.VesselGroups }],
      query: () => 'vessel_groups',
      transformErrorResponse: response => new FrontendApiError(GET_VESSELS_GROUPS_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetAllVesselGroupsQuery } = vesselGroupApi
