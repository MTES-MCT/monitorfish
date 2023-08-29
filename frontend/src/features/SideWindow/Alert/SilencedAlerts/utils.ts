import { FormError, FormErrorCode } from '../../../../libs/FormError'

import type { SilencedAlertFormValues } from './types'
import type { SilencedAlertData } from '../../../../domain/entities/alerts/types'

export function getSilencedAlertFromSilencedAlertFormValues(formValues: SilencedAlertFormValues): SilencedAlertData {
  if (!formValues.flagState) {
    throw new FormError(formValues, 'flagState', FormErrorCode.MISSING_OR_UNDEFINED)
  }

  if (!formValues.silencedBeforeDate) {
    throw new FormError(formValues, 'silencedBeforeDate', FormErrorCode.MISSING_OR_UNDEFINED)
  }

  if (!formValues.value) {
    throw new FormError(formValues, 'value', FormErrorCode.MISSING_OR_UNDEFINED)
  }

  if (!formValues.vesselIdentifier) {
    throw new FormError(formValues, 'vesselIdentifier', FormErrorCode.MISSING_OR_UNDEFINED)
  }

  if (!formValues.vesselName) {
    throw new FormError(formValues, 'vesselName', FormErrorCode.MISSING_OR_UNDEFINED)
  }

  return {
    externalReferenceNumber: formValues.externalReferenceNumber || null,
    flagState: formValues.flagState,
    internalReferenceNumber: formValues.internalReferenceNumber || null,
    ircs: formValues.ircs || null,
    silencedBeforeDate: formValues.silencedBeforeDate,
    value: formValues.value,
    vesselId: formValues.vesselId || null,
    vesselIdentifier: formValues.vesselIdentifier,
    vesselName: formValues.vesselName
  }
}
