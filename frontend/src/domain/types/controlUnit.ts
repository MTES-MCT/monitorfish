import type { ControlResource } from './controlResource'
import type { Undefine } from '@mtes-mct/monitor-ui'
import type { Except } from 'type-fest'

export namespace ControlUnit {
  export interface ControlUnit {
    administration: string
    contact: string | undefined
    id: number
    name: string
    resources: ControlResource[]
  }

  export type ControlUnitData = Except<ControlUnit, 'id'>

  export type ControlUnitDraft = Undefine<ControlUnitData>
}
