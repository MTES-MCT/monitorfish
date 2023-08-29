import type { SilencedAlertData } from '../../../../domain/entities/alerts/types'

export type SilencedAlertFormValues = Partial<SilencedAlertData>

export const emptySilencedAlert: SilencedAlertFormValues = {
  externalReferenceNumber: null,
  internalReferenceNumber: null,
  ircs: null,
  vesselId: null
}
