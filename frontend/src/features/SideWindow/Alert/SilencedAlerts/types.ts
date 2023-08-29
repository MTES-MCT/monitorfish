import type { SilencedAlertData } from '../../../../domain/entities/alerts/types'

export type SilencedAlertFormValues = Partial<SilencedAlertData>

export const emptySilencedAlert: SilencedAlertFormValues = {
  externalReferenceNumber: null,
  flagState: undefined,
  internalReferenceNumber: null,
  ircs: null,
  silencedBeforeDate: undefined,
  value: undefined,
  vesselId: null,
  vesselIdentifier: undefined,
  vesselName: undefined
}
