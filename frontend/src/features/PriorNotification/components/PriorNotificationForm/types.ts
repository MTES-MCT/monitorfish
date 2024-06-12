import type { PriorNotification } from '../../PriorNotification.types'
import type { UndefineExcept } from '@mtes-mct/monitor-ui'

export type FormValues = UndefineExcept<
  PriorNotification.NewPriorNotificationData,
  'didNotFishAfterZeroNotice' | 'fishingCatches' | 'tripGearCodes'
> & {
  isExpectedLandingDateSameAsExpectedArrivalDate: boolean
}
