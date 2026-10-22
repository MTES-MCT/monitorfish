import { monitorfishApi } from '@api/api'
import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'
import { getUrlOrPathWithQueryParams } from '@utils/getUrlOrPathWithQueryParams'

import type { UserManagement } from './types'
import type { BackendApi } from '@api/BackendApi.types'

const ADD_USER_ERROR_MESSAGE = "Nous n'avons pas pu ajouter cet utilisateur."
const GET_AUTHORIZATION_AUDIT_LOGS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer le journal des habilitations."
const GET_USERS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des utilisateurs."
const REPLACE_ADMINISTRATION_USERS_ERROR_MESSAGE =
  "Nous n'avons pas pu mettre à jour les utilisateurs de cette administration."
const UPDATE_USER_IS_ADMINISTRATOR_ERROR_MESSAGE =
  "Nous n'avons pas pu modifier les droits d'administrateur de cet utilisateur."
const DELETE_USER_ERROR_MESSAGE = "Nous n'avons pas pu supprimer cet utilisateur."
const GET_AUTHORIZED_ORGANIZATIONAL_UNITS_ERROR_MESSAGE =
  "Nous n'avons pas pu récupérer la liste des services autorisés."
const ADD_AUTHORIZED_ORGANIZATIONAL_UNIT_ERROR_MESSAGE = "Nous n'avons pas pu ajouter ce service."
const DELETE_AUTHORIZED_ORGANIZATIONAL_UNIT_ERROR_MESSAGE = "Nous n'avons pas pu supprimer ce service."

export const userManagementApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    addAuthorizedOrganizationalUnit: builder.mutation<void, string>({
      invalidatesTags: [
        { type: RtkCacheTagType.AuthorizedOrganizationalUnits },
        { type: RtkCacheTagType.AuthorizationAuditLogs }
      ],
      query: organizationalUnit => ({
        body: { organizationalUnit },
        method: 'POST',
        url: '/admin/authorized_organizational_units'
      }),
      transformErrorResponse: response =>
        new FrontendApiError(ADD_AUTHORIZED_ORGANIZATIONAL_UNIT_ERROR_MESSAGE, response)
    }),

    addUser: builder.mutation<void, UserManagement.NewUser>({
      invalidatesTags: [{ type: RtkCacheTagType.Users }, { type: RtkCacheTagType.AuthorizationAuditLogs }],
      query: newUser => ({
        body: newUser,
        method: 'POST',
        url: '/admin/users'
      }),
      transformErrorResponse: response => new FrontendApiError(ADD_USER_ERROR_MESSAGE, response)
    }),

    deleteAuthorizedOrganizationalUnit: builder.mutation<void, string>({
      invalidatesTags: [
        { type: RtkCacheTagType.AuthorizedOrganizationalUnits },
        { type: RtkCacheTagType.AuthorizationAuditLogs }
      ],
      query: organizationalUnit => ({
        method: 'DELETE',
        params: { organizationalUnit },
        url: '/admin/authorized_organizational_units'
      }),
      transformErrorResponse: response =>
        new FrontendApiError(DELETE_AUTHORIZED_ORGANIZATIONAL_UNIT_ERROR_MESSAGE, response)
    }),

    deleteUser: builder.mutation<void, string>({
      invalidatesTags: [{ type: RtkCacheTagType.Users }, { type: RtkCacheTagType.AuthorizationAuditLogs }],
      query: hashedEmail => ({
        method: 'DELETE',
        url: `/admin/users/${hashedEmail}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_USER_ERROR_MESSAGE, response)
    }),

    getAuthorizationAuditLogs: builder.query<
      BackendApi.ResponseBodyPaginatedList<UserManagement.AuthorizationAuditLog>,
      { apiPaginationParams: BackendApi.RequestPaginationParams; filters: UserManagement.AuthorizationAuditLogFilters }
    >({
      providesTags: () => [{ type: RtkCacheTagType.AuthorizationAuditLogs }],
      query: ({ apiPaginationParams, filters }) =>
        getUrlOrPathWithQueryParams('/admin/authorization_audit_logs', { ...apiPaginationParams, ...filters }),
      transformErrorResponse: response => new FrontendApiError(GET_AUTHORIZATION_AUDIT_LOGS_ERROR_MESSAGE, response)
    }),

    getAuthorizedOrganizationalUnits: builder.query<string[], void>({
      providesTags: () => [{ type: RtkCacheTagType.AuthorizedOrganizationalUnits }],
      query: () => '/admin/authorized_organizational_units',
      transformErrorResponse: response =>
        new FrontendApiError(GET_AUTHORIZED_ORGANIZATIONAL_UNITS_ERROR_MESSAGE, response)
    }),

    getUsers: builder.query<UserManagement.User[], void>({
      providesTags: () => [{ type: RtkCacheTagType.Users }],
      query: () => '/admin/users',
      transformErrorResponse: response => new FrontendApiError(GET_USERS_ERROR_MESSAGE, response)
    }),

    replaceAdministrationUsers: builder.mutation<
      UserManagement.ReplacedAdministrationUsers,
      UserManagement.ReplaceAdministrationUsersData
    >({
      invalidatesTags: [{ type: RtkCacheTagType.Users }, { type: RtkCacheTagType.AuthorizationAuditLogs }],
      query: ({ administration, emails, isEmptyListConfirmed }) => ({
        body: { emails, isEmptyListConfirmed },
        method: 'PUT',
        url: `/admin/users/administrations/${administration}`
      }),
      transformErrorResponse: response => new FrontendApiError(REPLACE_ADMINISTRATION_USERS_ERROR_MESSAGE, response)
    }),

    updateUserIsAdministrator: builder.mutation<void, { hashedEmail: string; isAdministrator: boolean }>({
      invalidatesTags: [{ type: RtkCacheTagType.Users }, { type: RtkCacheTagType.AuthorizationAuditLogs }],
      query: ({ hashedEmail, isAdministrator }) => ({
        body: { isAdministrator },
        method: 'PUT',
        url: `/admin/users/${hashedEmail}/administrator`
      }),
      transformErrorResponse: response => new FrontendApiError(UPDATE_USER_IS_ADMINISTRATOR_ERROR_MESSAGE, response)
    })
  })
})

export const {
  useAddAuthorizedOrganizationalUnitMutation,
  useAddUserMutation,
  useDeleteAuthorizedOrganizationalUnitMutation,
  useDeleteUserMutation,
  useGetAuthorizationAuditLogsQuery,
  useGetAuthorizedOrganizationalUnitsQuery,
  useGetUsersQuery,
  useReplaceAdministrationUsersMutation,
  useUpdateUserIsAdministratorMutation
} = userManagementApi
