import { HttpStatusCode } from '@api/constants'
import { isString } from 'lodash-es'

export function isUnauthorizedOrForbidden(httpStatus: number | string | undefined) {
  if (!httpStatus || isString(httpStatus)) {
    return false
  }

  return [HttpStatusCode.FORBIDDEN, HttpStatusCode.UNAUTHORIZED].includes(httpStatus)
}
