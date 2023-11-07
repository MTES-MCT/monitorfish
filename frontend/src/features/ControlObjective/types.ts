import type { Float, Integer } from 'type-fest'

export type ControlObjective = {
  controlPriorityLevel: Float<number>
  facade: string
  id: number
  segment: string
  targetNumberOfControlsAtPort: number
  targetNumberOfControlsAtSea: number
  year: number
}

export type UpdateControlObjectivePayload = {
  controlPriorityLevel: Float<number> | null
  targetNumberOfControlsAtPort: Integer<number> | null
  targetNumberOfControlsAtSea: Integer<number> | null
}

export type UpdateControlObjective = {
  id: string
  updatedFields: UpdateControlObjectivePayload
}

export type CreateControlObjectivePayload = {
  facade: string
  segment: string
  year: number
}
