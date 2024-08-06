import type { PriorNotification } from '../../PriorNotification.types'
import type { UndefineExcept } from '@mtes-mct/monitor-ui'

export type ManualPriorNotificationFormValues = UndefineExcept<
  Omit<PriorNotification.NewManualFormData, 'updatedAt'>,
  'didNotFishAfterZeroNotice' | 'fishingCatches' | 'tripGearCodes'
> & {
  isExpectedLandingDateSameAsExpectedArrivalDate: boolean
}
