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

// TODO Check why there is a `Unused '@ts-expect-error' directive.` error here.
// @ts-ignore @ts-expect-error
export const undefinableTestInterfaceWithMissingProp: UndefinableTestInterface = {
  firstProp: undefined
}

describe('types', () => {
  /**
   * This test is required by jest to pass the error : "Your test suite must contain at least one test."
   *
   * The actual tests are running when checkin TS types (by `npm run test:type:partial`):
   * - undefinableTestInterface
   * - undefinableTestInterfaceWithMissingProp
   */
  it('dummy test ', async () => {})
})
