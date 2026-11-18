import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { configureStore } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query'
import { startSpan } from '@sentry/react'

import { RTK_RETRY_OPTIONS } from '../retry'
import { withAttemptSpan } from '../withAttemptSpan'

const mockSpan = { setStatus: jest.fn() }

jest.mock('@sentry/react', () => ({
  setMeasurement: jest.fn(),
  startSpan: jest.fn((_options: unknown, callback: (span: unknown) => unknown) => callback(mockSpan))
}))

describe('api/withAttemptSpan()', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
    global.fetch = originalFetch
  })

  it('Should trace each attempt of a retried query in its own span', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue(new Response('[]', { headers: { 'Content-Type': 'application/json' }, status: 200 })) as any
    const api = createApi({
      baseQuery: retry(
        withAttemptSpan('[Fish API]', fetchBaseQuery({ baseUrl: 'http://localhost/bff/v1' })),
        RTK_RETRY_OPTIONS
      ),
      endpoints: builder => ({ getVessels: builder.query<unknown[], void>({ query: () => 'vessels' }) })
    })
    const store = configureStore({
      middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
      reducer: { [api.reducerPath]: api.reducer }
    })

    const request = store.dispatch(api.endpoints.getVessels.initiate())
    await jest.advanceTimersByTimeAsync(1000)
    const result = await request

    expect(result.data).toEqual([])
    expect(startSpan).toHaveBeenCalledTimes(2)
    expect(startSpan).toHaveBeenCalledWith({ name: '[Fish API] [RTK QUERY] getVessels' }, expect.any(Function))
    expect(mockSpan.setStatus).toHaveBeenCalledTimes(1)
    expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: 2, message: 'FETCH_ERROR' })
  })
})
