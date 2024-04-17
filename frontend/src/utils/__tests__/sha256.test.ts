import { describe, expect, it } from '@jest/globals'
import { sha256 } from '@utils/sha256'
import { webcrypto } from 'node:crypto'
import { TextEncoder, TextDecoder } from 'util'

describe('utils/sha256()', () => {
  it('should compute a sha256 hash', async () => {
    // Given we reproduce a crypto context available in the browser (secure mode)
    Object.defineProperty(globalThis, 'crypto', {
      value: webcrypto
    })
    Object.assign(global, { TextDecoder, TextEncoder })

    // When
    const hashedEmail = await sha256('dummy@email.fr')

    // Then
    expect(hashedEmail).toEqual('b3fb54a2fd281bc83a63bf76971cf2b246d59f1358083d243995cbecde5391e7')
  })
})
