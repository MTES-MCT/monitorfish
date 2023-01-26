import type { ControlResource } from './controlResource'
import type { Undefine } from '../../types'
import type { Except } from 'type-fest'

export interface ControlUnit {
  administration: string
  contact: string | undefined
  id: number
  name: string
  resources: ControlResource[]
}

export type ControlUnitData = Except<ControlUnit, 'id'>

export type ControlUnitDraft = Undefine<ControlUnitData>
