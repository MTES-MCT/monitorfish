import { expect } from '@jest/globals'

// `computeIsEISREnabled` reads these constants on each call, so mutating the mocked
// module between tests lets us vary the configuration.
jest.mock('../../constants', () => ({
  E_ISR_APPLICATION_DATE: '2026-06-01',
  E_ISR_CONTROL_UNITS_FOR_TEST: [],
  E_ISR_ENABLED: true
}))

// eslint-disable-next-line import/first
import { computeIsEISREnabled } from '../useIsEISREnabled'

// Same instance required by the module under test, so mutations are picked up.
const mockConstants = jest.requireMock('../../constants') as {
  E_ISR_APPLICATION_DATE: string
  E_ISR_CONTROL_UNITS_FOR_TEST: number[]
  E_ISR_ENABLED: boolean
}

describe('computeIsEISREnabled', () => {
  beforeEach(() => {
    mockConstants.E_ISR_ENABLED = true
    mockConstants.E_ISR_CONTROL_UNITS_FOR_TEST = []
    mockConstants.E_ISR_APPLICATION_DATE = '2026-06-01'
  })

  it('should return false When e-ISR is globally disabled', () => {
    mockConstants.E_ISR_ENABLED = false

    expect(computeIsEISREnabled([10499], '2026-06-15')).toBe(false)
  })

  it('should return false When the control date is before the application date', () => {
    expect(computeIsEISREnabled([10499], '2026-05-31')).toBe(false)
  })

  it('should return true When the control date is on the application date', () => {
    expect(computeIsEISREnabled([], '2026-06-01')).toBe(true)
  })

  it('should return true When the control date is after the application date', () => {
    expect(computeIsEISREnabled([], '2026-06-15')).toBe(true)
  })

  it('should ignore the date gating When no control date is provided', () => {
    expect(computeIsEISREnabled([])).toBe(true)
  })

  it('should ignore the date gating When the application date is empty', () => {
    mockConstants.E_ISR_APPLICATION_DATE = ''

    expect(computeIsEISREnabled([], '2020-01-01')).toBe(true)
  })

  describe('with a control unit restriction', () => {
    beforeEach(() => {
      mockConstants.E_ISR_CONTROL_UNITS_FOR_TEST = [10499]
    })

    it('should return true When a control date is after the application date and the unit is whitelisted', () => {
      expect(computeIsEISREnabled([10499], '2026-06-15')).toBe(true)
    })

    it('should return false When the unit is not whitelisted, even after the application date', () => {
      expect(computeIsEISREnabled([1], '2026-06-15')).toBe(false)
    })

    it('should return false When the unit is whitelisted but the control date is before the application date', () => {
      expect(computeIsEISREnabled([10499], '2026-05-31')).toBe(false)
    })
  })
})
