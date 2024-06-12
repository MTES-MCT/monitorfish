import type { PriorNotification } from '../../PriorNotification.types'
import type { UndefineExcept } from '@mtes-mct/monitor-ui'

export type FormValues = UndefineExcept<
  PriorNotification.NewManualPriorNotificationData,
  'didNotFishAfterZeroNotice' | 'fishingCatches' | 'tripGearCodes'
> & {
  isExpectedLandingDateSameAsExpectedArrivalDate: boolean
}
