import type { ControlUnit, UndefineExceptArrays } from '@mtes-mct/monitor-ui'

export type ControlUnitResourceFormValues = UndefineExceptArrays<ControlUnit.NewControlUnitResourceData> & {
  id?: number
}
