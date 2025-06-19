import { BackendApi } from '@api/BackendApi.types'
import { HttpStatusCode } from '@api/constants'
import { isString } from 'lodash-es'

import type { SafeParseReturnType } from 'zod'

export function isUnauthorizedOrForbidden(httpStatus: number | string | undefined) {
  if (!httpStatus || isString(httpStatus)) {
    return false
  }

  return [HttpStatusCode.FORBIDDEN, HttpStatusCode.UNAUTHORIZED].includes(httpStatus)
}

export function valueOrUndefinedIfNotFoundOrThrow<Type>(
  result: SafeParseReturnType<any, any>,
  response: BackendApi.ResponseBodyError | Type
): Type | undefined {
  if (!result.success) {
    if ((response as BackendApi.ResponseBodyError).code === BackendApi.ErrorCode.NOT_FOUND_BUT_OK) {
      return undefined
    }

    throw result.error
  }

  return response as Type
}
