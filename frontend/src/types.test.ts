import type { Undefine } from './types'

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
