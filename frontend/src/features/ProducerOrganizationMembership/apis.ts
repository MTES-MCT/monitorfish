import { monitorfishApi } from '@api/api'
import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'

import type { ProducerOrganizationMembership } from '@features/ProducerOrganizationMembership/types'

const GET_PRODUCER_ORGANIZATION_MEMBERSHIP_ERROR_MESSAGE = "Nous n'avons pas pu récupérer l'OP de ce navire."
const GET_PRODUCER_ORGANIZATION_MEMBERSHIPS_ERROR_MESSAGE =
  "Nous n'avons pas pu récupérer la liste des adhérents aux OP."
const SET_PRODUCER_ORGANIZATION_MEMBERSHIPS_ERROR_MESSAGE = "Nous n'avons pas pu mettre à jour les adhésions aux OPs."

export const producerOrganizationMembershipApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getProducerOrganizationMembership: builder.query<ProducerOrganizationMembership, string>({
      query: internalReferenceNumber => `/producer_organization_memberships/${internalReferenceNumber}`,
      transformErrorResponse: response =>
        new FrontendApiError(GET_PRODUCER_ORGANIZATION_MEMBERSHIP_ERROR_MESSAGE, response)
    }),

    getProducerOrganizationMemberships: builder.query<ProducerOrganizationMembership[], void>({
      providesTags: () => [{ type: RtkCacheTagType.ProducerOrganizationMemberships }],
      query: () => `/producer_organization_memberships`,
      transformErrorResponse: response =>
        new FrontendApiError(GET_PRODUCER_ORGANIZATION_MEMBERSHIPS_ERROR_MESSAGE, response)
    }),

    setProducerOrganizationMemberships: builder.mutation<void, ProducerOrganizationMembership[]>({
      invalidatesTags: () => [{ type: RtkCacheTagType.ProducerOrganizationMemberships }],
      query: membership => ({
        body: membership,
        method: 'POST',
        url: `/producer_organization_memberships`
      }),
      transformErrorResponse: response =>
        new FrontendApiError(SET_PRODUCER_ORGANIZATION_MEMBERSHIPS_ERROR_MESSAGE, response)
    })
  })
})

export const { useGetProducerOrganizationMembershipsQuery } = producerOrganizationMembershipApi
