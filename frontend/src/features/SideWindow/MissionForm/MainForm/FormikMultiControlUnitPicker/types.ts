import type { ControlUnit } from '../../../../../domain/types/controlUnit'
import type { Option } from '@mtes-mct/monitor-ui'

export type PartialControlUnit = Pick<ControlUnit, 'administration' | 'id' | 'name'>
// TODO Integrate once https://github.com/MTES-MCT/monitor-ui/pull/325 is merged and released.
export type PartialControlUnitOption = Option<number> & {
  optionValue: PartialControlUnit
}
