import { isObject } from './isObject'
import { nullify } from './nullify'
import { undefinedize } from './undefinedize'
import { FrontendError } from '../libs/FrontendError'

import type { BaseQueryEnhancer, FetchArgs } from '@reduxjs/toolkit/dist/query'

export const normalizeRtkBaseQuery: BaseQueryEnhancer<unknown, {}, {} | void> =
  baseQuery => async (args: string | FetchArgs, api) => {
    try {
      const argsWithNullifiedBody =
        typeof args === 'object' && isObject(args.body)
          ? {
              ...args,
              body: nullify(args.body)
            }
          : args

      const result = await baseQuery(argsWithNullifiedBody, api, {})

      const normalizedResult = result.data
        ? ({
            ...result,
            data: undefinedize(result.data)
          } as any)
        : result

      return normalizedResult
    } catch (err) {
      throw new FrontendError('An unexpected error happened.', 'normalizeRtkBaseQuery()', err)
    }
  }
