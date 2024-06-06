import type { FormValues } from './types'

export function isZeroNotice(formValues: FormValues) {
  return formValues.fishingCatches.every(fishingCatch => fishingCatch.weight === 0)
}
