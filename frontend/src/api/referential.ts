import { localStorageManager } from '@libs/LocalStorageManager'
import { LocalStorageKey } from '@libs/LocalStorageManager/constants'

import { monitorfishApi } from './api'

import type { CustomResponseError } from './types'
import type { Regulation } from '@features/Regulation/Regulation.types'
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit'
import type { BaseQueryApi, FetchBaseQueryMeta, QueryReturnValue } from '@reduxjs/toolkit/query'

type MaybePromise<T> = T | PromiseLike<T>

export type ReferentialName = 'gears' | 'infractions' | 'ports' | 'regulations' | 'species'
export type ReferentialVersions = Record<ReferentialName, string>

/** The referentials change a few times a day: they are re-downloaded only when their version changes. */
export const REFERENTIAL_VERSIONS_POLLING_INTERVAL = 2 * 60 * 60 * 1000

export const referentialApi = monitorfishApi.injectEndpoints({
  endpoints: builder => ({
    getReferentialVersions: builder.query<ReferentialVersions, void>({
      extraOptions: { maxRetries: 1 },
      query: () => 'referentials/versions'
    }),
    getRegulatoryCatalogue: builder.query<Regulation.RegulatoryZoneGeoJsonFeatureCollection, void>({
      // Kept in the regulation slice: the RTK cache would hold a second copy of the whole catalogue
      keepUnusedDataFor: 0,
      queryFn: getVersionedReferential<Regulation.RegulatoryZoneGeoJsonFeatureCollection>(
        'regulations',
        'regulations/catalogue'
      )
    })
  })
})

export const { useGetReferentialVersionsQuery } = referentialApi

/**
 * The version of a referential, to request it with `?v=<version>` and let the browser keep it.
 *
 * Without connection (at sea), the last known versions are used: the browser then serves the referentials from its
 * cache without any request.
 */
export async function getReferentialVersion(
  dispatch: ThunkDispatch<any, any, UnknownAction>,
  name: ReferentialName
): Promise<string | undefined> {
  try {
    const versions = await dispatch(
      referentialApi.endpoints.getReferentialVersions.initiate(undefined, { subscribe: false })
    ).unwrap()
    saveLastReferentialVersions(versions)

    return versions[name]
  } catch {
    return getLastReferentialVersions()?.[name]
  }
}

export function getVersionedReferentialUrl(url: string, version: string | undefined): string {
  return version ? `${url}?v=${encodeURIComponent(version)}` : url
}

export function getLastReferentialVersions(): ReferentialVersions | undefined {
  try {
    return localStorageManager.get<ReferentialVersions>(LocalStorageKey.ReferentialVersions)
  } catch {
    return undefined
  }
}

export function saveLastReferentialVersions(versions: ReferentialVersions) {
  try {
    localStorageManager.set(LocalStorageKey.ReferentialVersions, versions)
  } catch {
    // Private browsing or full storage: the versions are fetched again on the next load
  }
}

/**
 * A `queryFn` requesting a referential with its current version, so that the browser keeps it between sessions.
 */
export function getVersionedReferential<ResultType>(name: ReferentialName, url: string) {
  return async (
    _arg: unknown,
    api: BaseQueryApi,
    _extraOptions: unknown,
    baseQuery: (arg: string) => MaybePromise<QueryReturnValue<unknown, unknown, unknown>>
  ) => {
    const version = await getReferentialVersion(api.dispatch, name)

    return (await baseQuery(getVersionedReferentialUrl(url, version))) as QueryReturnValue<
      ResultType,
      CustomResponseError,
      FetchBaseQueryMeta | undefined
    >
  }
}
