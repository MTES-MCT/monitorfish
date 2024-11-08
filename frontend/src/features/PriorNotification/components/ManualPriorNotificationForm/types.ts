import type { PriorNotification } from '../../PriorNotification.types'
import type { Vessel } from '@features/Vessel/Vessel.types'
import type { UndefineExcept } from '@mtes-mct/monitor-ui'

export type ManualPriorNotificationFormValues = UndefineExcept<
  Omit<PriorNotification.ManualForm, 'fishingCatches' | 'reportId' | 'updatedAt' | 'vesselId'>,
  'didNotFishAfterZeroNotice' | 'tripGearCodes'
> & {
  fishingCatches: ManualPriorNotificationFormValuesFishingCatch[]
  hasGlobalFaoArea: boolean
  isExpectedLandingDateSameAsExpectedArrivalDate: boolean
  vesselIdentity: Vessel.VesselIdentity | undefined
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
