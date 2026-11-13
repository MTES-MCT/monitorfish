export type AuthorizedUser = {
  email: string
  isAdministrator: boolean
  isSuperUser: boolean
}

export type CsrfToken = { headerName: string; parameterName: string; token: string }
