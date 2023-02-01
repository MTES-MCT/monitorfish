import { expect } from '@jest/globals'

import { getOptionsFromLabelledEnum } from '../getOptionsFromLabelledEnum'

describe('utils/getOptionsFromLabelledEnum()', () => {
  it('should return the expected array of options', () => {
    enum LabelledEnum {
      ONE = 'one',
      TWO = 'two'
    }

    const result = getOptionsFromLabelledEnum(LabelledEnum)

    expect(result).toStrictEqual([
      {
        label: 'one',
        value: 'ONE'
      },
      {
        label: 'two',
        value: 'TWO'
      }
    ])
  })

  it('should return an empty array with an empty enum', () => {
    enum LabelledEnum {}

    const result = getOptionsFromLabelledEnum(LabelledEnum)

    expect(result).toStrictEqual([])
  })
})
