import { z } from 'zod'

import { MissionAction as MissionActionConstants } from './missionAction.constants'
import { FleetSegmentSchema } from './schemas/FleetSegmentSchema'
import { GearControlSchema } from './schemas/GearControlSchema'
import { InfractionSchema } from './schemas/InfractionSchema'
import { MissionActionSchema } from './schemas/MissionActionSchema'
import { NatinfSchema } from './schemas/NatinfSchema'
import { SpeciesControlSchema } from './schemas/SpeciesControlSchema'
import { ThreatSchema } from './schemas/ThreatSchema'

import type { ThreatCharacterizationSchema } from '@features/Mission/schemas/ThreatCharacterizationSchema'

export namespace MissionAction {
  // ---------------------------------------------------------------------------
  // Re-exported constants from missionAction.constants.ts
  export import ControlCheck = MissionActionConstants.ControlCheck
  export import FlightGoal = MissionActionConstants.FlightGoal
  export import FLIGHT_GOAL_LABEL = MissionActionConstants.FLIGHT_GOAL_LABEL
  export import InfractionType = MissionActionConstants.InfractionType
  export import INFRACTION_TYPE_LABEL = MissionActionConstants.INFRACTION_TYPE_LABEL
  export import MissionActionType = MissionActionConstants.MissionActionType
  export import CompletionStatus = MissionActionConstants.CompletionStatus

  export type FleetSegment = z.infer<typeof FleetSegmentSchema>
  export type GearControl = z.infer<typeof GearControlSchema>
  export type Infraction = z.infer<typeof InfractionSchema>
  export type MissionAction = z.infer<typeof MissionActionSchema>
  export type Natinf = z.infer<typeof NatinfSchema>
  export type SpeciesControl = z.infer<typeof SpeciesControlSchema>
  export type Threat = z.infer<typeof ThreatSchema>
  export type ThreatCharacterization = z.infer<typeof ThreatCharacterizationSchema>

  // ---------------------------------------------------------------------------
  // Types

  export type ControlAndText = {
    control: MissionAction | undefined
    text: string
  }

  export type LastControls = {
    LAND: ControlAndText
    SEA: ControlAndText
  }

  export type MissionActionData = Omit<MissionAction, 'id' | 'portName'> & {
    id: MissionAction['id'] | undefined
  }

  export type MissionControlsSummary = {
    controls: MissionAction[]
    numberOfControlsWithSomeGearsSeized: number
    numberOfControlsWithSomeSpeciesSeized: number
    numberOfDiversions: number
    vesselId: number
  }

  export enum FrontCompletionStatus {
    COMPLETED = 'COMPLETED',
    TO_COMPLETE = 'TO_COMPLETE',
    TO_COMPLETE_MISSION_ENDED = 'TO_COMPLETE_MISSION_ENDED',
    UP_TO_DATE = 'UP_TO_DATE'
  }

  export enum FrontCompletionStatusLabel {
    COMPLETED = 'Complétées',
    TO_COMPLETE = 'À compléter',
    UP_TO_DATE = 'À jour'
  }
}
