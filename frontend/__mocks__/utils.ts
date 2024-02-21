import { afterAll, beforeAll, jest } from '@jest/globals'

export function mockConsole() {
  const originalConsole = {} as Record<keyof Console, any>
  const methods = ['error', 'group', 'info', 'log', 'warning']

  beforeAll(() => {
    methods.forEach(method => {
      originalConsole[method] = console[method]
      console[method] = jest.fn()
    })
  })

  afterAll(() => {
    methods.forEach(method => {
      console[method] = originalConsole[method]
    })
  })
}
