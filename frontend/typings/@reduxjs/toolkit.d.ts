import '@reduxjs/toolkit'

declare module '@reduxjs/toolkit' {
  // @reduxjs/toolkit/src/query/core/apiState.ts
  export type RefetchConfigOptions = {
    refetchOnFocus: boolean
    refetchOnMountOrArgChange: boolean | number
    refetchOnReconnect: boolean
  }
}
