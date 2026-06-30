/* eslint-disable jest/no-export, jest/expect-expect -- This is a type-level test: the exported
   consts are validated by `tsc` via the `@ts-expect-error`/`@ts-expect-no-error` annotations, and
   the dummy `it` only satisfies jest's "must contain at least one test" requirement. */
import { describe, it } from '@jest/globals'

import type { Undefine } from '@mtes-mct/monitor-ui'

interface TestInterface {
  firstProp: number
  secondProp: string
}

type UndefinableTestInterface = Undefine<TestInterface>

// @ts-expect-no-error
export const undefinableTestInterface: UndefinableTestInterface = {
  firstProp: undefined,
  secondProp: undefined
}

// @ts-expect-error
export const undefinableTestInterfaceWithMissingProp: UndefinableTestInterface = {
  firstProp: undefined
}

describe('types', () => {
  /**
   * This test is required by jest to pass the error : "Your test suite must contain at least one test."
   *
   * The actual tests are running when checkin TS types (by `npm run test:type`):
   * - undefinableTestInterface
   * - undefinableTestInterfaceWithMissingProp
   */
  it('dummy test', async () => {})
})
