import { afterEach, describe, expect, it } from '@jest/globals'

import { getCsrfHeaders, getCsrfToken } from '../csrf'

describe('api/csrf', () => {
  afterEach(() => {
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  })

  it('getCsrfToken() should read and decode the XSRF-TOKEN cookie', () => {
    document.cookie = 'OTHER=value'
    document.cookie = `XSRF-TOKEN=${encodeURIComponent('a+b/c=')}`

    expect(getCsrfToken()).toBe('a+b/c=')
  })

  it('getCsrfHeaders() should only send the header when the cookie is set', () => {
    expect(getCsrfHeaders()).toEqual({})

    document.cookie = 'XSRF-TOKEN=token'

    expect(getCsrfHeaders()).toEqual({ 'X-XSRF-TOKEN': 'token' })
  })
})
