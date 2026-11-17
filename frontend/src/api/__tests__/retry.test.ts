import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { configureStore } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query'

import { RTK_RETRY_OPTIONS, shouldRetryRtkQuery } from '../retry'

const QUERY = { type: 'query' as const }
const MUTATION = { type: 'mutation' as const }

describe('api/retry', () => {
  describe('shouldRetryRtkQuery()', () => {
    it('Should retry a query 3 times When the network or a gateway fails', () => {
      ;['FETCH_ERROR', 'TIMEOUT_ERROR', 502, 503, 504].forEach(status => {
        const error = { error: 'Failed to fetch', status } as any

        expect(shouldRetryRtkQuery(error, { attempt: 3, baseQueryApi: QUERY, extraOptions: undefined })).toBe(true)
        expect(shouldRetryRtkQuery(error, { attempt: 4, baseQueryApi: QUERY, extraOptions: undefined })).toBe(false)
      })
    })

    it('Should retry a mutation or another error only once', () => {
      const fetchError = { error: 'Failed to fetch', status: 'FETCH_ERROR' } as const
      const serverError = { data: {}, status: 500 }

      expect(shouldRetryRtkQuery(fetchError, { attempt: 1, baseQueryApi: MUTATION, extraOptions: undefined })).toBe(
        true
      )
      expect(shouldRetryRtkQuery(fetchError, { attempt: 2, baseQueryApi: MUTATION, extraOptions: undefined })).toBe(
        false
      )
      expect(shouldRetryRtkQuery(serverError, { attempt: 1, baseQueryApi: QUERY, extraOptions: undefined })).toBe(true)
      expect(shouldRetryRtkQuery(serverError, { attempt: 2, baseQueryApi: QUERY, extraOptions: undefined })).toBe(false)
    })

    it('Should not retry When the user is not authorized, or the endpoint disables the retries', () => {
      const fetchError = { error: 'Failed to fetch', status: 'FETCH_ERROR' } as const

      expect(
        shouldRetryRtkQuery({ data: {}, status: 401 }, { attempt: 1, baseQueryApi: QUERY, extraOptions: undefined })
      ).toBe(false)
      expect(
        shouldRetryRtkQuery({ data: {}, status: 403 }, { attempt: 1, baseQueryApi: QUERY, extraOptions: undefined })
      ).toBe(false)
      expect(
        shouldRetryRtkQuery(fetchError, { attempt: 1, baseQueryApi: QUERY, extraOptions: { maxRetries: 0 } })
      ).toBe(false)
    })
  })

  describe('RTK_RETRY_OPTIONS', () => {
    const originalFetch = global.fetch

    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
      global.fetch = originalFetch
    })

    it('Should get the response of a query once a satellite link cut of a few seconds is over', async () => {
      let isLinkCut = true
      global.fetch = jest.fn(() =>
        isLinkCut
          ? Promise.reject(new TypeError('Failed to fetch'))
          : Promise.resolve(new Response('[]', { headers: { 'Content-Type': 'application/json' }, status: 200 }))
      ) as any
      const api = createApi({
        baseQuery: retry(fetchBaseQuery({ baseUrl: 'http://localhost/bff/v1' }), RTK_RETRY_OPTIONS),
        endpoints: builder => ({ getVessels: builder.query<unknown[], void>({ query: () => 'vessels' }) })
      })
      const store = configureStore({
        middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
        reducer: { [api.reducerPath]: api.reducer }
      })

      const request = store.dispatch(api.endpoints.getVessels.initiate())
      await jest.advanceTimersByTimeAsync(1000 + 3000)
      isLinkCut = false
      await jest.advanceTimersByTimeAsync(6000)
      const result = await request

      expect(global.fetch).toHaveBeenCalledTimes(4)
      expect(result.data).toEqual([])
    })
  })
})
