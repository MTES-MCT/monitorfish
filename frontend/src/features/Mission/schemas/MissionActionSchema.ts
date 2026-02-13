import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'
import { MissionAction } from '../missionAction.constants'
import { FleetSegmentSchema } from './FleetSegmentSchema'
import { GearControlSchema } from './GearControlSchema'
import { InfractionSchema } from './InfractionSchema'
import { SpeciesControlSchema } from './SpeciesControlSchema'
import { LegacyControlUnitSchema } from '../../ControlUnit/schemas/LegacyControlUnitSchema'

export const MissionActionSchema = z.strictObject({
  actionDatetimeUtc: z.string(),
  actionEndDatetimeUtc: stringOrUndefined,
  actionType: z.enum(MissionAction.MissionActionType),
  completedBy: stringOrUndefined,
  completion: z.enum(MissionAction.CompletionStatus),
  controlQualityComments: stringOrUndefined,
  controlUnits: z.array(LegacyControlUnitSchema),
  districtCode: stringOrUndefined,
  emitsAis: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  emitsVms: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  externalReferenceNumber: stringOrUndefined,
  facade: stringOrUndefined,
  faoAreas: z.array(z.string()),
  flagState: stringOrUndefined,
  flightGoals: z.array(z.enum(MissionAction.FlightGoal)),
  gearOnboard: z.array(GearControlSchema),
  hasSomeGearsSeized: z.boolean(),
  hasSomeSpeciesSeized: z.boolean(),
  id: z.number(),
  infractions: z.array(InfractionSchema),
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
  isAdministrativeControl: booleanOrUndefined,
  isComplianceWithWaterRegulationsControl: booleanOrUndefined,
  isFromPoseidon: booleanOrUndefined,
  isLastHaul: z.boolean(),
  isSafetyEquipmentAndStandardsComplianceControl: booleanOrUndefined,
  isSeafarersControl: booleanOrUndefined,
  latitude: numberOrUndefined,
  licencesAndLogbookObservations: stringOrUndefined,
  licencesMatchActivity: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  logbookMatchesActivity: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  longitude: numberOrUndefined,
  missionId: z.number(),
  numberOfVesselsFlownOver: numberOrUndefined,
  observationsByUnit: stringOrUndefined,
  otherComments: stringOrUndefined,
  portLocode: stringOrUndefined,
  // This field is added by the API
  portName: stringOrUndefined,
  segments: z.array(FleetSegmentSchema),
  seizureAndDiversion: booleanOrUndefined,
  seizureAndDiversionComments: stringOrUndefined,
  separateStowageOfPreservedSpecies: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  speciesObservations: stringOrUndefined,
  speciesOnboard: z.array(SpeciesControlSchema),
  speciesQuantitySeized: numberOrUndefined,
  speciesSizeControlled: booleanOrUndefined,
  speciesWeightControlled: booleanOrUndefined,
  unitWithoutOmegaGauge: booleanOrUndefined,
  userTrigram: stringOrUndefined,
  vesselId: numberOrUndefined,
  vesselName: stringOrUndefined,
  vesselTargeted: z.union([z.enum(MissionAction.ControlCheck), z.undefined()])
})
