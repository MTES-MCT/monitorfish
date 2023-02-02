import { expect } from '@jest/globals'

import { nullify } from '../nullify'

describe('utils/nullify()', () => {
  const getPojo = (index: number) => ({
    aBoolean: true,
    aNull: null,
    aNumber: index,
    anUndefined: undefined,
    aString: `String ${index}`
  })

  it('should return the expected result with a complex object', () => {
    const value = {
      ...getPojo(1),
      anArray: [getPojo(2), getPojo(3)],
      anObject: getPojo(4)
    }

    const result = nullify(value)

    expect(result).toStrictEqual({
      aBoolean: true,
      aNull: null,
      aNumber: 1,
      anUndefined: null,
      aString: 'String 1',

      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      anArray: [
        {
          aBoolean: true,
          aNull: null,
          aNumber: 2,
          anUndefined: null,
          aString: 'String 2'
        },
        {
          aBoolean: true,
          aNull: null,
          aNumber: 3,
          anUndefined: null,
          aString: 'String 3'
        }
      ],

      anObject: {
        aBoolean: true,
        aNull: null,
        aNumber: 4,
        anUndefined: null,
        aString: 'String 4'
      }
    })
  })

  it('should return the expected result with a complex array', () => {
    const value = [
      getPojo(1),
      {
        ...getPojo(2),
        anObject: getPojo(3)
      }
    ]

    const result = nullify(value)

    expect(result).toStrictEqual([
      {
        aBoolean: true,
        aNull: null,
        aNumber: 1,
        anUndefined: null,
        aString: 'String 1'
      },
      {
        aBoolean: true,
        aNull: null,
        aNumber: 2,
        anUndefined: null,
        aString: 'String 2',

        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        anObject: {
          aBoolean: true,
          aNull: null,
          aNumber: 3,
          anUndefined: null,
          aString: 'String 3'
        }
      }
    ])
  })
})
