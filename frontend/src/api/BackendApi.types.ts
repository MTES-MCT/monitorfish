import type { AnyEnum } from '@mtes-mct/monitor-ui'
import type { AnyObject } from 'yup'

export namespace BackendApi {
  // ---------------------------------------------------------------------------
  // Request

  export type RequestPaginationParams = {
    pageNumber: number
    pageSize: number
  }

  export type RequestSortingParams<T extends AnyEnum = AnyEnum> = {
    sortColumn: T[keyof T]
    sortDirection: SortDirection
  }

  export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC'
  }

  // ---------------------------------------------------------------------------
  // Response

  export interface ResponseBodyBoolean {
    value: boolean
  }

  export type ResponseBodyPaginatedList<
    ItemData extends AnyObject = AnyObject,
    ExtraData extends AnyObject | undefined = undefined
  > = {
    data: ItemData[]
    /** Useful to pass custom extraneous data. */
    extraData: ExtraData
    /** Last page index. */
    lastPageNumber: number
    /** Page index. */
    pageNumber: number
    /** Number of items per page. */
    pageSize: number
    /** Total number of items. */
    totalLength: number
  }

  export interface ResponseBodyError {
    code: ErrorCode | null
    data: any
    type: ErrorCode | null
  }

  // Don't forget to mirror any update here in the backend enum.
  export enum ErrorCode {
    AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
    EXISTING_MISSION_ACTION = 'EXISTING_MISSION_ACTION',
    /** Thrown when attempting to delete an entity which has  to non-archived children. */
    FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',

    /** Thrown when attempting to archive an entity linked to non-archived children. */
    UNARCHIVED_CHILD = 'UNARCHIVED_CHILD'
  }
}

export interface Meta {
  response?: {
    headers: Headers
  }
}
