import type { ControlUnit, UndefineExcept } from '@mtes-mct/monitor-ui'

export type ControlUnitContactFormValues = UndefineExcept<
  ControlUnit.ControlUnitContactData | ControlUnit.NewControlUnitContactData,
  'isEmailSubscriptionContact' | 'isSmsSubscriptionContact'
> & {
  id?: number
}
