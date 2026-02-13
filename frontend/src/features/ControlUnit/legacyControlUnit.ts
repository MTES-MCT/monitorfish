import { z } from 'zod'

import { LegacyControlUnitResourceSchema as _LegacyControlUnitResourceSchema } from './schemas/LegacyControlUnitResourceSchema'
import { LegacyControlUnitSchema as _LegacyControlUnitSchema } from './schemas/LegacyControlUnitSchema'

import type { Undefine } from '@mtes-mct/monitor-ui'

export namespace LegacyControlUnit {
  export const LegacyControlUnitResourceSchema = _LegacyControlUnitResourceSchema
  export const LegacyControlUnitSchema = _LegacyControlUnitSchema

  export type LegacyControlUnitResource = z.infer<typeof LegacyControlUnitResourceSchema>
  export type LegacyControlUnit = z.infer<typeof LegacyControlUnitSchema>

  export type LegacyControlUnitDraft = Omit<Undefine<LegacyControlUnit>, 'resources'> &
    Pick<LegacyControlUnit, 'resources'>
}
