import type { PriorNotification } from '../../PriorNotification.types'
import type { UndefineExcept } from '@mtes-mct/monitor-ui'

export type ManualPriorNotificationFormValues = UndefineExcept<
  Omit<PriorNotification.NewManualForm, 'fishingCatches' | 'updatedAt'>,
  'didNotFishAfterZeroNotice' | 'tripGearCodes'
> & {
  fishingCatches: ManualPriorNotificationFormValuesFishingCatch[]
  hasGlobalFaoArea: boolean
  isExpectedLandingDateSameAsExpectedArrivalDate: boolean
}

export type ManualPriorNotificationFormValuesFishingCatch = PriorNotification.FormDataFishingCatch & {
  $bluefinTunaExtendedCatch?: {
    BF1: {
      quantity: number
      specyName: string
      weight: number
    }
    BF2: {
      quantity: number
      specyName: string
      weight: number
    }
    BF3: {
      quantity: number
      specyName: string
      weight: number
    }
  }
}
