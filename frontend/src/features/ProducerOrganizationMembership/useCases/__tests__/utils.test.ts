import { getDummyCsv } from '@features/ProducerOrganizationMembership/useCases/__tests__/__mocks__/dummyCsv'
import { getNextMembershipsFromFile } from '@features/ProducerOrganizationMembership/useCases/utils/utils'
import { expect } from '@jest/globals'

describe('features/ProducerOrganizationMembership/useCases/utils', () => {
  it('getNextMembershipsFromFile Should return the next memberships', async () => {
    // Given
    const csv = getDummyCsv()

    // When
    const nextMemberships = await getNextMembershipsFromFile(csv)

    // Then
    expect(nextMemberships).toEqual([
      { internalReferenceNumber: '12345', joiningDate: '01/10/2024', organizationName: 'Organization 1' }
    ])
  })
})
