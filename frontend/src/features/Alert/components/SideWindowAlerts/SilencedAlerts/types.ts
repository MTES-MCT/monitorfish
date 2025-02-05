import type { SilencedAlertData } from '../../../types'

export type SilencedAlertFormValues = Partial<SilencedAlertData>

export const emptySilencedAlert: SilencedAlertFormValues = {
  externalReferenceNumber: undefined,
  internalReferenceNumber: undefined,
  ircs: undefined,
  vesselId: undefined
}
