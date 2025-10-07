import { cloneDeep, mergeWith, isArray } from 'lodash-es'
import { type ZodTypeAny } from 'zod'

/**
 * Deep merge two or more objects (non-mutating), concatenating arrays.
 * Similar behavior to `deepmerge`.
 */
function deepMerge<T = any>(...sources: Partial<T>[]): T {
  if (sources.length === 0) {
    return {} as T
  }
  if (sources.length === 1) {
    return cloneDeep(sources[0]) as T
  }

  const customizer = (objValue: unknown, srcValue: unknown) =>
    isArray(objValue) && isArray(srcValue) ? [...objValue, ...srcValue] : undefined

  return sources.slice(1).reduce((target, source) => mergeWith(target, source, customizer), cloneDeep(sources[0])) as T
}

/**
 * Convert a Zod v4 schema into a Formik `validate` function.
 *
 * - `schema` is any Zod schema (ZodTypeAny) — object, array, union, etc.
 * - `params` is forwarded to `safeParse` if you need it (kept untyped to avoid v4 type issues).
 *
 * Returns a function `(values) => errors` compatible with Formik's `validate` prop.
 */
export const toFormikValidationSchema =
  (schema: ZodTypeAny, params?: unknown) =>
  (values: any): Record<string, any> => {
    const result = schema.safeParse(values, params as any)

    if (result.success) {
      return {}
    }

    // Build a nested error object for each issue, merging them together
    return result.error.issues.reduce((acc: Record<string, any>, issue) => {
      const nested = issue.path.reduceRight<Record<string, any>>(
        (errors, pathSegment) => ({
          // If `errors` is empty, set the message; otherwise keep the nested errors object.
          [pathSegment]: Object.keys(errors).length ? errors : issue.message
        }),
        {}
      )

      return deepMerge(acc, nested)
    }, {})
  }
