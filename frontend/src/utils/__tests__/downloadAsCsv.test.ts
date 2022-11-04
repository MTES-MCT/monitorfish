import { expect } from '@jest/globals'

import { downloadAsCsv } from '../downloadAsCsv'

import type { Options } from 'export-to-csv'

jest.mock('export-to-csv', () => {
  class ExportToCsv {
    options: Options

    constructor(options: Options) {
      this.options = options
    }

    // eslint-disable-next-line class-methods-use-this
    public generateCsv(jsonData: any): any {
      return jsonData
    }
  }

  return {
    ExportToCsv
  }
})

describe('utils/downloadAsCsv()', () => {
  it('should return the expected CSV', () => {
    const data = [
      {
        aMap: new Map(),
        anObject: {
          anotherObject: {
            anotherNumber: 2
          },
          anotherString: 'Another string'
        },
        // eslint-disable-next-line no-null/no-null
        aNull: null,
        aNumber: 1,
        anUndefined: undefined,
        aString: 'A string'
      }
    ]

    const result = downloadAsCsv(data)

    expect(result).toStrictEqual([
      {
        aMap: '[object Map]',
        'anObject.anotherObject.anotherNumber': 2,
        'anObject.anotherString': 'Another string',
        // eslint-disable-next-line no-null/no-null
        aNull: null,
        aNumber: 1,
        anUndefined: undefined,
        aString: 'A string'
      }
    ])
  })

  it('should return undefined with an empty array', () => {
    const data = []

    const result = downloadAsCsv(data)

    expect(result).toBeUndefined()
  })
})
