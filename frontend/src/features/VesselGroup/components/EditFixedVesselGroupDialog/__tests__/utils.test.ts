import { getVesselsDummyCsv } from '@features/VesselGroup/components/EditFixedVesselGroupDialog/__tests__/__mocks__/getVesselsDummyCsv'
import { getVesselsFromFile } from '@features/VesselGroup/components/EditFixedVesselGroupDialog/utils'
import { expect } from '@jest/globals'

describe('features/VesselGroup/components/EditFixedVesselGroupDialog/utils', () => {
  it('getVesselsFromFile Should return the vessels', async () => {
    // Given
    const csv = getVesselsDummyCsv()

    // When
    const vessels = await getVesselsFromFile(csv)

    // Then
    expect(vessels).toEqual([
      {
        cfr: 'FR114515646',
        externalIdentification: 'EMFS',
        flagState: 'FR',
        ircs: 'FW658',
        name: 'LE BAT@',
        vesselId: undefined,
        vesselIdentifier: undefined
      }
    ])
  })
})
