export type AuthorizedUser = {
  email: string
  isSuperUser: boolean
}

export type CsrfToken = { headerName: string; parameterName: string; token: string }
