import type { AnyObject } from '@mtes-mct/monitor-ui/types'

// Don't forget to mirror any update here in the backend enum.
export enum ApiErrorCode {
  /** Thrown when attempting to delete an entity which has  to non-archived children. */
  FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',
  /** Thrown when attempting to archive an entity linked to non-archived children. */
  UNARCHIVED_CHILD = 'UNARCHIVED_CHILD'
}

export interface BackendApiErrorResponse {
  type: ApiErrorCode | null
}

export interface BackendApiBooleanResponse {
  value: boolean
}

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
  responseData: BackendApiErrorResponse
  status: number | 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'CUSTOM_ERROR'
}
