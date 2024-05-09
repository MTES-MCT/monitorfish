import { Seafront } from '@constants/seafront'
import { getYearsToReportings } from '@features/Reporting/utils'
import { expect } from '@jest/globals'

import { PendingAlertValueType } from '../../../domain/entities/alerts/types'
import { VesselIdentifier } from '../../../domain/entities/vessel/types'
import { ReportingType } from '../../../domain/types/reporting'

import type { PendingAlertReporting } from '../../../domain/types/reporting'

describe('utils', () => {
  it('getYearsToReportingList should return years to reportings', () => {
    // Given
    const fromDate = new Date(2018, 0, 1)
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
      creationDate: '2023-12-30T15:08:05.845121Z',
      validationDate: null
    }
    const thirdReporting: PendingAlertReporting = {
      ...firstReporting,
      validationDate: '2024-12-30T15:08:15.845121Z'
    }

    // When
    const result = getYearsToReportings(fromDate, [firstReporting, secondReporting, thirdReporting])

    // Then
    expect(result).toStrictEqual({
      '2019': [],
      '2020': [],
      '2021': [],
      '2022': [],
      '2023': [
        {
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
          type: 'ALERT',
          underCharter: null,
          validationDate: '2023-10-30T15:08:05.845121Z',
          value: {
            dml: null,
            natinfCode: 2610,
            seaFront: 'NAMO',
            type: 'TWELVE_MILES_FISHING_ALERT'
          },
          vesselId: 1234568,
          vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER',
          vesselName: 'A VESSEL'
        },
        {
          creationDate: '2023-12-30T15:08:05.845121Z',
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
          type: 'ALERT',
          underCharter: null,
          validationDate: null,
          value: {
            dml: null,
            natinfCode: 2610,
            seaFront: 'NAMO',
            type: 'TWELVE_MILES_FISHING_ALERT'
          },
          vesselId: 1234568,
          vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER',
          vesselName: 'A VESSEL'
        }
      ],
      '2024': [
        {
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
          type: 'ALERT',
          underCharter: null,
          validationDate: '2024-12-30T15:08:15.845121Z',
          value: {
            dml: null,
            natinfCode: 2610,
            seaFront: 'NAMO',
            type: 'TWELVE_MILES_FISHING_ALERT'
          },
          vesselId: 1234568,
          vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER',
          vesselName: 'A VESSEL'
        }
      ]
    })
  })
})
