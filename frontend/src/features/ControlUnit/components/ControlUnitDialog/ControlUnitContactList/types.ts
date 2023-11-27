import type { ControlUnit, UndefineExceptArrays } from '@mtes-mct/monitor-ui'

export type ControlUnitContactFormValues = UndefineExceptArrays<
  ControlUnit.ControlUnitContactData | ControlUnit.NewControlUnitContactData
> & {
  id?: number
}
