import { Seafront } from '@constants/seafront'
import { expect } from '@jest/globals'

import { PendingAlertValueType } from '../../../../../../domain/entities/alerts/types'
import { VesselIdentifier } from '../../../../../../domain/entities/vessel/types'
import { ReportingType } from '../../../../../../domain/types/reporting'
import { getSortedReportingsAndOccurrences } from '../utils'

import type { PendingAlertReporting } from '../../../../../../domain/types/reporting'

describe('Reportings/Archived/utils.getSortedReportingsAndOccurrences()', () => {
  it('Should build the last reporting and other occurrences object', () => {
    // Given
    const firstReporting: PendingAlertReporting = {
      creationDate: '2023-10-30T09:10:00Z',
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
      underCharter: null,
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
      id: 123456,
      validationDate: '2023-12-30T15:08:05.845121Z'
    }
    const thirdReporting: PendingAlertReporting = {
      ...firstReporting,
      id: 1234567,
      validationDate: '2024-12-30T15:08:05.845121Z'
    }
    const fourthReporting: PendingAlertReporting = {
      ...firstReporting,
      id: 12345678,
      value: {
        dml: null,
        natinfCode: 2610,
        seaFront: Seafront.NAMO,
        type: PendingAlertValueType.MISSING_FAR_ALERT
      }
    }

    // When
    const result = getSortedReportingsAndOccurrences([firstReporting, secondReporting, thirdReporting, fourthReporting])

    // Then
    expect(result).toHaveLength(2)
    expect(result[0]?.reporting?.id).toEqual(1234567)
    expect(result[0]?.otherOccurrences.length).toEqual(2)
    expect(result[0]?.otherOccurrences[0]?.id).toEqual(12345)
    expect(result[0]?.otherOccurrences[1]?.id).toEqual(123456)

    expect(result[1]?.reporting?.id).toEqual(12345678)
    expect(result[1]?.otherOccurrences?.length).toEqual(0)
  })
})
