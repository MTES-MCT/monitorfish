import { expect } from '@jest/globals'
import dayjs from 'dayjs'

import { downloadAsCsv } from '../downloadAsCsv'

import type { DownloadAsCsvMap } from '../downloadAsCsv'
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

const TEST_DATA = [
  {
    aDayjsInstance: dayjs('2022-06-21'),
    aMap: new Map(),
    anObject: {
      anotherObject: {
        anotherNumber: 2
      },
      anotherString: 'Another string'
    },
    // eslint-disable-next-line no-null/no-null
    aNull: null,
    aNumber: 4.2,
    aNumberToRelabel: 123,
    anUndefined: undefined,
    aString: 'A string',
    aStringToRelabel: 'Another string',
    id: 1
  }
]
const TEST_FILENAME = 'a-filename.csv'

describe('utils/downloadAsCsv()', () => {
  it('should return the expected CSV', () => {
    const csvMap: DownloadAsCsvMap<typeof TEST_DATA[0]> = {
      aDayjsInstance: {
        label: 'Année',
        transform: item => item.aDayjsInstance.year()
      },
      aMap: 'aMap',
      'anObject.anotherObject.anotherNumber': 'anObject.anotherObject.anotherNumber',
      'anObject.anotherString': 'anObject.anotherString',
      aNonexistentKey: 'aNonexistentKey',
      aNull: 'aNull',
      aNumber: 'aNumber',
      aNumberToRelabel: {
        label: 'A number label'
      },
      anUndefined: 'anUndefined',
      aString: 'aString',
      aStringToRelabel: 'A string label',
      id: 'id'
    }

    const result = downloadAsCsv(TEST_FILENAME, TEST_DATA, csvMap)

    expect(result).toStrictEqual([
      {
        'A number label': 123,
        'A string label': 'Another string',
        aMap: '[object Map]',
        Année: 2022,
        'anObject.anotherObject.anotherNumber': 2,
        'anObject.anotherString': 'Another string',
        aNonexistentKey: '',
        // eslint-disable-next-line no-null/no-null
        aNull: '',
        aNumber: 4.2,
        anUndefined: '',
        aString: 'A string',
        id: 1
      }
    ])
  })

  it('should return undefined with an empty array', () => {
    const data = []
    const csvMap = {}

    const result = downloadAsCsv(TEST_FILENAME, data, csvMap)

    expect(result).toBeUndefined()
  })

  it('should return undefined with an empty CSV map', () => {
    const csvMap = {}

    const result = downloadAsCsv(TEST_FILENAME, TEST_DATA, csvMap)

    expect(result).toBeUndefined()
  })
})
