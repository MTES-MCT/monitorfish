import type { AnyEnum, CollectionItem } from '@mtes-mct/monitor-ui'

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

  export type ResponseBodyPaginatedList<T extends CollectionItem = CollectionItem> = {
    data: T[]
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
    type: ErrorCode | null
  }

  // Don't forget to mirror any update here in the backend enum.
  export enum ErrorCode {
    EXISTING_MISSION_ACTION = 'EXISTING_MISSION_ACTION',
    /** Thrown when attempting to delete an entity which has  to non-archived children. */
    FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',

    /** Thrown when attempting to archive an entity linked to non-archived children. */
    UNARCHIVED_CHILD = 'UNARCHIVED_CHILD'
  }
}
