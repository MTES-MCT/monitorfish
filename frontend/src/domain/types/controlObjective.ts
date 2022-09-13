import type { Float, Integer } from 'type-fest'

export type ControlObjective = {
  controlPriorityLevel: Float<number>
  facade: string
  id: Integer<number>
  segment: string
  targetNumberOfControlsAtPort: Integer<number>
  targetNumberOfControlsAtSea: Integer<number>
  year: Integer<number>
}

export type UpdateControlObjective = {
  controlPriorityLevel: Float<number> | null
  targetNumberOfControlsAtPort: Integer<number> | null
  targetNumberOfControlsAtSea: Integer<number> | null
}
