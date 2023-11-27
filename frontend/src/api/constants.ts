import { FIVE_MINUTES } from '../constants'

export const RTK_COMMON_QUERY_OPTIONS = {
  pollingInterval: FIVE_MINUTES
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NOT_FOUND = 404
}
