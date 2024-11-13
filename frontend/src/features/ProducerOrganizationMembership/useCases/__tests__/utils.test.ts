import { getDummyCsv } from '@features/ProducerOrganizationMembership/useCases/__tests__/__mocks__/dummyCsv'
import { getNextMembershipsFromFile } from '@features/ProducerOrganizationMembership/useCases/utils/utils'
import { expect, jest } from '@jest/globals'
import { read, utils } from 'xlsx'

// Mocks
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn()
  }
}))

describe('features/ProducerOrganizationMembership/useCases/utils', () => {
  it('getNextMembershipsFromFile Should return the next memberships', async () => {
    // Given
    // @ts-ignore
    read.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} }
    })
    // @ts-ignore
    utils.sheet_to_json.mockReturnValue([
      ['CFR', '', '', '', '', '', '', '', 'Date', '', '', 'Organization'],
      ['12345', '', '', '', '', '', '', '', '01/10/2024', '', '', 'Organization 1']
    ])

    // When
    const nextMemberships = await getNextMembershipsFromFile(getDummyCsv())

    // Then
    expect(nextMemberships).toEqual([
      { internalReferenceNumber: '12345', joiningDate: '01/10/2024', organizationName: 'Organization 1' }
    ])
  })
})
