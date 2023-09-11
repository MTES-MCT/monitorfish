import { expect } from '@jest/globals'

import { BeaconMalfunctionVesselStatus, EndOfBeaconMalfunctionReason } from '../constants'
import { getMalfunctionStartDateText } from '../index'

describe('domain/entities/beaconMalfunction/index.getMalfunctionStartDateText()', () => {
  it('should return the right status', () => {
    const beaconMalfunction = {
      beaconNumber: 'NOT_FOUND',
      endOfBeaconMalfunctionReason: EndOfBeaconMalfunctionReason.BEACON_DEACTIVATED_OR_UNEQUIPPED,
      externalReferenceNumber: '08FR65465',
      flagState: 'FR',
      id: 5,
      internalReferenceNumber: 'FR263465414',
      ircs: 'IR123',
      malfunctionEndDateTime: null,
      malfunctionStartDateTime: '2023-08-21T11:17:22.997231Z',
      notificationRequested: null,
      riskFactor: null,
      stage: 'ARCHIVED',
      vesselId: 12,
      vesselIdentifier: 'EXTERNAL_REFERENCE_NUMBER',
      vesselName: 'LE b@TO 2',
      vesselStatus: BeaconMalfunctionVesselStatus.ON_SALE,
      vesselStatusLastModificationDateTime: '2023-08-28T11:17:22.997231Z'
    }

    const result = getMalfunctionStartDateText(beaconMalfunction)

    expect(result).toEqual('Balise désactivée ')
  })
})
