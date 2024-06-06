import { INITIAL_FORM_VALUES } from './constants'

import type { FormValues } from './types'

export function getInitialFormValues(): FormValues {
  return {
    ...INITIAL_FORM_VALUES,
    sentAt: new Date().toISOString()
  }
}

export function isZeroNotice(formValues: FormValues) {
  return formValues.fishingCatches.every(fishingCatch => fishingCatch.weight === 0)
}
