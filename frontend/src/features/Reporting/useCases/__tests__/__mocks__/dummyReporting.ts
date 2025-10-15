import { Seafront } from '@constants/seafront'
import { PendingAlertValueType } from '@features/Alert/constants'
import { ReportingType } from '@features/Reporting/types'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'

import type { PendingAlertReporting } from '@features/Reporting/types'

export const fortyHeightHourAlertReporting: PendingAlertReporting = {
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
    name: 'Message FAR 48h',
    natinfCode: 2610,
    seaFront: Seafront.NAMO,
    type: PendingAlertValueType.MISSING_FAR_48_HOURS_ALERT
  },
  vesselId: 1234568,
  vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
  vesselName: 'A VESSEL'
}
