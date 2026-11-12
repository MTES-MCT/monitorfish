/**
 * Replaces `@mtes-mct/monitor-ui` in the web worker bundle (see `worker.plugins` in `vite.config.ts`).
 *
 * monitor-ui is published as a single module which can't be tree-shaken: importing one helper bundles
 * the whole library (React, rsuite, styled-components...), i.e. ~540 KB gzipped downloaded by every user
 * for the worker alone. Only the runtime helpers used in the worker's import graph are implemented here,
 * the build fails if another one is imported.
 *
 * Keep the behavior identical to monitor-ui: see `__tests__/monitorUiWorkerShim.test.ts`.
 */

import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import localeData from 'dayjs/plugin/localeData'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import updateLocale from 'dayjs/plugin/updateLocale'
import utc from 'dayjs/plugin/utc'
import { remove as removeDiacritics } from 'diacritics'
import Fuse, { type FuseOptionKeyObject } from 'fuse.js'

import type { CustomSearchOptions, Option } from '@mtes-mct/monitor-ui'

dayjs.extend(isBetween)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(localeData)
dayjs.extend(quarterOfYear)
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(updateLocale)
dayjs.locale('fr')

export const customDayjs = dayjs

export enum Level {
  ERROR = 'ERROR',
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING'
}

export class CustomSearch<T> {
  readonly #fuse: Fuse<T>
  readonly #isDiacriticSensitive: boolean
  readonly #isStrict: boolean

  constructor(
    collection: T[],
    keys: Array<FuseOptionKeyObject<T>>,
    {
      cacheKey,
      childrenKey,
      isCaseSensitive = false,
      isDiacriticSensitive = false,
      isStrict = false,
      shouldIgnoreLocation = true,
      threshold = 0.4
    }: CustomSearchOptions = {}
  ) {
    if (cacheKey !== undefined || childrenKey !== undefined || keys.some(key => !key.getFn)) {
      throw new Error('This option of `CustomSearch` is not implemented in the web worker.')
    }

    this.#fuse = new Fuse(collection, {
      ignoreLocation: shouldIgnoreLocation,
      isCaseSensitive,
      keys,
      threshold,
      useExtendedSearch: isStrict
    })
    this.#isDiacriticSensitive = isDiacriticSensitive
    this.#isStrict = isStrict
  }

  find(query: string, limit?: number): T[] {
    const normalizedQuery = (this.#isDiacriticSensitive ? query : removeDiacritics(query)).trim()
    const fuseQuery = this.#isStrict
      ? normalizedQuery
          .split(/\s+/)
          .map(word => `'${word}`)
          .join(' ')
      : normalizedQuery

    return this.#fuse.search(fuseQuery, limit ? { limit } : undefined).map(({ item }) => item)
  }
}

export function getOptionsFromLabelledEnum<T extends Record<string, string>>(
  labelledEnum: T,
  mustSort = false
): Option<keyof T>[] {
  const options = Object.entries(labelledEnum).map(([value, label]) => ({ label, value }))

  return mustSort ? options.sort((a, b) => a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' })) : options
}

export function getPseudoRandomString(): string {
  return `${new Date().toISOString()}${Math.random().toString(36).slice(2)}`
}
