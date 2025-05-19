import { Seafront } from '@constants/seafront'
import { ReportingType } from '@features/Reporting/types'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { expect } from '@jest/globals'

import { PendingAlertValueType } from '../../../../Alert/types'
import { sortByValidationOrCreationDateDesc } from '../utils'

import type { PendingAlertReporting } from '@features/Reporting/types'

describe('Reportings/Current/utils.sortByValidationOrCreationDateDesc()', () => {
  it('Should return reportings sorted by date desc', () => {
    // Given
    const firstReporting: PendingAlertReporting = {
      creationDate: '2023-10-30T09:10:00Z',
      expirationDate: undefined,
      externalReferenceNumber: '',
      flagState: 'ES',
      id: 12345,
      infraction: {
        infraction:
          'Pêche maritime non autorisée dans les eaux territoriales francaise par capitaine de navire communautaire',
        infractionCategory: 'FISHING',
        natinfCode: 2610,
        regulation: 'ART.L.945-2 §I AL.1, ART.L.945-5 1°,2°,3°,4° C.RUR'
      },
      internalReferenceNumber: 'FR04504564',
      ircs: '',
      isArchived: false,
      isDeleted: false,
      type: ReportingType.ALERT,
      underCharter: undefined,
      validationDate: '2023-10-30T15:08:05.845121Z',
      value: {
        dml: null,
        natinfCode: 2610,
        seaFront: Seafront.NAMO,
        type: PendingAlertValueType.TWELVE_MILES_FISHING_ALERT
      },
      vesselId: 1234568,
      vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
      vesselName: 'A VESSEL'
    }
    const secondReporting: PendingAlertReporting = {
      ...firstReporting,
      validationDate: '2023-12-30T15:08:05.845121Z'
    }
    const thirdReporting: PendingAlertReporting = {
      ...firstReporting,
      validationDate: '2024-12-30T15:08:05.845121Z'
    }

    // When
    const result = [firstReporting, secondReporting, thirdReporting].sort((a, b) =>
      sortByValidationOrCreationDateDesc(a, b)
    )

    // Then
    expect(result).toHaveLength(3)
    expect(result[0]?.validationDate).toEqual('2024-12-30T15:08:05.845121Z')
    expect(result[1]?.validationDate).toEqual('2023-12-30T15:08:05.845121Z')
    expect(result[2]?.validationDate).toEqual('2023-10-30T15:08:05.845121Z')
  })
})
