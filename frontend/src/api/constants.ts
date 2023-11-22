import { FIVE_MINUTES } from '../constants'

export const ARCHIVE_GENERIC_ERROR_MESSAGE = 'An unexpected error occurred while attempting to archive this entity.'
export const DELETE_GENERIC_ERROR_MESSAGE = 'An unexpected error occurred while attempting to delete this entity.'

export const RTK_DEFAULT_QUERY_OPTIONS = {
  pollingInterval: FIVE_MINUTES
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NOT_FOUND = 404
}
