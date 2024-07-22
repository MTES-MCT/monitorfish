import type { PriorNotification } from '../../PriorNotification.types'
import type { UndefineExcept } from '@mtes-mct/monitor-ui'

export type FormValues = UndefineExcept<
  Omit<PriorNotification.NewManualPriorNotificationData, 'updatedAt'>,
  'didNotFishAfterZeroNotice' | 'fishingCatches' | 'tripGearCodes'
> & {
  isExpectedLandingDateSameAsExpectedArrivalDate: boolean
}
