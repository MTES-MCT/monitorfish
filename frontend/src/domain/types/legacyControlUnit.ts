import type { Undefine } from '@mtes-mct/monitor-ui'
import type { Except } from 'type-fest'

export namespace LegacyControlUnit {
  export interface LegacyControlUnit {
    administration: string
    contact: string | undefined
    id: number
    isArchived: boolean
    name: string
    resources: LegacyControlUnitResource[]
  }

  export type LegacyControlUnitData = Except<LegacyControlUnit, 'id'>

  export type LegacyControlUnitDraft = Omit<Undefine<LegacyControlUnit>, 'resources'> &
    Pick<LegacyControlUnit, 'resources'>

  export interface LegacyControlUnitResource {
    id: number
    name: string
  }
}
