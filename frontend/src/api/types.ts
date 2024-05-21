import type { BackendApi } from './BackendApi.types'
import type { AnyObject } from '@mtes-mct/monitor-ui'

export type RTKBaseQueryArgs =
  // Query
  | string
  // Mutation
  | {
      body?: AnyObject
      method: 'DELETE' | 'POST' | 'PUT'
      /** URL Path (and not full URL). */
      url: string
    }

export interface CustomRTKResponseError {
  path: string
  requestData: AnyObject | undefined
  responseData: BackendApi.ResponseBodyError
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'CUSTOM_ERROR'
}
