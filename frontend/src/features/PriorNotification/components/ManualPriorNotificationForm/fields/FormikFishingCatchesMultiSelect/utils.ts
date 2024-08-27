import type { ManualPriorNotificationFormValues } from '../../types'
import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'
import type { FormikErrors } from 'formik'

export function getFishingsCatchesValidationError(
  formErrors: FormikErrors<ManualPriorNotificationFormValues>
): string | undefined {
  if (!formErrors.fishingCatches) {
    return undefined
  }

  if (typeof formErrors.fishingCatches === 'string') {
    return formErrors.fishingCatches
  }

  const fishingCatchesErrors = formErrors.fishingCatches as Array<
    FormikErrors<PriorNotification.FormDataFishingCatch | undefined>
  >

  const faoAreaError = fishingCatchesErrors.find(fishingCatchError => typeof fishingCatchError?.faoArea === 'string')
  if (faoAreaError) {
    return faoAreaError.faoArea as string
  }

  const weightError = fishingCatchesErrors.find(fishingCatchError => typeof fishingCatchError?.weight === 'string')
  if (weightError) {
    return weightError.weight as string
  }

  return undefined
}
