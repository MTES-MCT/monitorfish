import { monitorfishApi } from '@api/api'
import { RtkCacheTagType } from '@api/constants'
import {
  type CreateOrUpdateDynamicVesselGroup,
  type CreateOrUpdateFixedVesselGroup,
  type DynamicVesselGroup,
  DynamicVesselGroupSchema,
  type FixedVesselGroup,
  FixedVesselGroupSchema,
  type VesselGroup,
  type VesselGroupWithVessels
} from '@features/VesselGroup/types'
import { FrontendApiError } from '@libs/FrontendApiError'
import { parseResponseOrReturn } from '@utils/parseResponseOrReturn'
import { orderBy } from 'lodash-es'
import z from 'zod'

const CREATE_VESSEL_GROUPS_ERROR_MESSAGE = "Nous n'avons pas pu créer le groupe de navires."
const GET_VESSELS_GROUPS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer les groupes de navires."
const DELETE_VESSEL_GROUP_ERROR_MESSAGE = "Nous n'avons pas pu supprimer le groupe de navires."
const DELETE_VESSEL_FROM__GROUP_ERROR_MESSAGE = "Nous n'avons pas pu supprimer le navire du groupe de navires."

export const vesselGroupApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    createOrUpdateDynamicVesselGroup: builder.mutation<DynamicVesselGroup, CreateOrUpdateDynamicVesselGroup>({
      invalidatesTags: () => [{ type: RtkCacheTagType.VesselGroups }],
      query: nextVesselGroupData => ({
        body: nextVesselGroupData,
        method: 'POST',
        url: `vessel_groups/dynamic`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_VESSEL_GROUPS_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: DynamicVesselGroup) =>
        parseResponseOrReturn<DynamicVesselGroup>(baseQueryReturnValue, DynamicVesselGroupSchema, false)
    }),
    createOrUpdateFixedVesselGroup: builder.mutation<FixedVesselGroup, CreateOrUpdateFixedVesselGroup>({
      invalidatesTags: () => [{ type: RtkCacheTagType.VesselGroups }],
      query: nextVesselGroupData => ({
        body: nextVesselGroupData,
        method: 'POST',
        url: `vessel_groups/fixed`
      }),
      transformErrorResponse: response => new FrontendApiError(CREATE_VESSEL_GROUPS_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: FixedVesselGroup) =>
        parseResponseOrReturn<FixedVesselGroup>(baseQueryReturnValue, FixedVesselGroupSchema, false)
    }),
    deleteVesselFromVesselGroup: builder.mutation<void, { groupId: number; vesselIndex: number }>({
      invalidatesTags: () => [{ type: RtkCacheTagType.VesselGroups }],
      query: ({ groupId, vesselIndex }) => ({
        method: 'DELETE',
        url: `/vessel_groups/${groupId}/${vesselIndex}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_VESSEL_FROM__GROUP_ERROR_MESSAGE, response)
    }),
    deleteVesselGroup: builder.mutation<void, number>({
      invalidatesTags: () => [{ type: RtkCacheTagType.VesselGroups }],
      query: id => ({
        method: 'DELETE',
        url: `/vessel_groups/${id}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_VESSEL_GROUP_ERROR_MESSAGE, response)
    }),
    getAllVesselGroups: builder.query<Array<VesselGroup>, void>({
      providesTags: () => [{ type: RtkCacheTagType.VesselGroups }],
      query: () => 'vessel_groups',
      transformErrorResponse: response => new FrontendApiError(GET_VESSELS_GROUPS_ERROR_MESSAGE, response),
      transformResponse: (baseQueryReturnValue: Array<VesselGroup>) =>
        orderBy(
          parseResponseOrReturn<VesselGroup>(
            baseQueryReturnValue,
            z.union([DynamicVesselGroupSchema, FixedVesselGroupSchema]),
            true
          ),
          vesselGroup => vesselGroup.id,
          ['desc']
        )
    }),
    getVesselGroupsWithVessels: builder.query<VesselGroupWithVessels[], void>({
      providesTags: () => [{ type: RtkCacheTagType.VesselGroups }],
      query: () => `/vessel_groups/vessels`,
      transformErrorResponse: response => new FrontendApiError(GET_VESSELS_GROUPS_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetAllVesselGroupsQuery, useGetVesselGroupsWithVesselsQuery } = vesselGroupApi
