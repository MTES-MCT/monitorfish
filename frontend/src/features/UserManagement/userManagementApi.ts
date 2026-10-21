import { monitorfishApi } from '@api/api'
import { RtkCacheTagType } from '@api/constants'
import { FrontendApiError } from '@libs/FrontendApiError'

import type { UserManagement } from './types'

const ADD_USER_ERROR_MESSAGE = "Nous n'avons pas pu ajouter cet utilisateur."
const GET_USERS_ERROR_MESSAGE = "Nous n'avons pas pu récupérer la liste des utilisateurs."
const REPLACE_ADMINISTRATION_USERS_ERROR_MESSAGE =
  "Nous n'avons pas pu mettre à jour les utilisateurs de cette administration."
const UPDATE_USER_IS_ADMINISTRATOR_ERROR_MESSAGE =
  "Nous n'avons pas pu modifier les droits d'administrateur de cet utilisateur."
const DELETE_USER_ERROR_MESSAGE = "Nous n'avons pas pu supprimer cet utilisateur."
const GET_AUTHORIZED_ORGANIZATIONAL_UNITS_ERROR_MESSAGE =
  "Nous n'avons pas pu récupérer la liste des unités organisationnelles autorisées."
const ADD_AUTHORIZED_ORGANIZATIONAL_UNIT_ERROR_MESSAGE = "Nous n'avons pas pu ajouter cette unité organisationnelle."
const DELETE_AUTHORIZED_ORGANIZATIONAL_UNIT_ERROR_MESSAGE =
  "Nous n'avons pas pu supprimer cette unité organisationnelle."

export const userManagementApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    addAuthorizedOrganizationalUnit: builder.mutation<void, string>({
      invalidatesTags: [{ type: RtkCacheTagType.AuthorizedOrganizationalUnits }],
      query: organizationalUnit => ({
        body: { organizationalUnit },
        method: 'POST',
        url: '/admin/authorized_organizational_units'
      }),
      transformErrorResponse: response =>
        new FrontendApiError(ADD_AUTHORIZED_ORGANIZATIONAL_UNIT_ERROR_MESSAGE, response)
    }),

    addUser: builder.mutation<void, UserManagement.NewUser>({
      invalidatesTags: [{ type: RtkCacheTagType.Users }],
      query: newUser => ({
        body: newUser,
        method: 'POST',
        url: '/admin/users'
      }),
      transformErrorResponse: response => new FrontendApiError(ADD_USER_ERROR_MESSAGE, response)
    }),

    deleteAuthorizedOrganizationalUnit: builder.mutation<void, string>({
      invalidatesTags: [{ type: RtkCacheTagType.AuthorizedOrganizationalUnits }],
      query: organizationalUnit => ({
        method: 'DELETE',
        params: { organizationalUnit },
        url: '/admin/authorized_organizational_units'
      }),
      transformErrorResponse: response =>
        new FrontendApiError(DELETE_AUTHORIZED_ORGANIZATIONAL_UNIT_ERROR_MESSAGE, response)
    }),

    deleteUser: builder.mutation<void, string>({
      invalidatesTags: [{ type: RtkCacheTagType.Users }],
      query: hashedEmail => ({
        method: 'DELETE',
        url: `/admin/users/${hashedEmail}`
      }),
      transformErrorResponse: response => new FrontendApiError(DELETE_USER_ERROR_MESSAGE, response)
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
      invalidatesTags: [{ type: RtkCacheTagType.Users }],
      query: ({ administration, emails }) => ({
        body: { emails },
        method: 'PUT',
        url: `/admin/users/administrations/${administration}`
      }),
      transformErrorResponse: response => new FrontendApiError(REPLACE_ADMINISTRATION_USERS_ERROR_MESSAGE, response)
    }),

    updateUserIsAdministrator: builder.mutation<void, { hashedEmail: string; isAdministrator: boolean }>({
      invalidatesTags: [{ type: RtkCacheTagType.Users }],
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
  useGetAuthorizedOrganizationalUnitsQuery,
  useGetUsersQuery,
  useReplaceAdministrationUsersMutation,
  useUpdateUserIsAdministratorMutation
} = userManagementApi
