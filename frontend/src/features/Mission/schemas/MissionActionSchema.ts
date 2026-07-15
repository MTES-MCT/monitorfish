import { z } from 'zod'

import { booleanOrUndefined, numberOrUndefined, stringOrUndefined } from '../../../types'
import { MissionAction } from '../missionAction.constants'
import { DiscardedSpeciesControlSchema } from './DiscardedSpeciesControlSchema'
import { FleetSegmentSchema } from './FleetSegmentSchema'
import { GearControlSchema } from './GearControlSchema'
import { InfractionSchema } from './InfractionSchema'
import { SpeciesOnboardControlSchema } from './SpeciesOnboardControlSchema'
import { LegacyControlUnitSchema } from '../../ControlUnit/schemas/LegacyControlUnitSchema'

export const MissionActionSchema = z.strictObject({
  actionDatetimeUtc: z.string(),
  actionEndDatetimeUtc: stringOrUndefined,
  actionType: z.enum(MissionAction.MissionActionType),
  approvedWeighingOperatorInformation: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  completedBy: stringOrUndefined,
  completion: z.enum(MissionAction.CompletionStatus),
  controlQualityComments: stringOrUndefined,
  controlUnits: z.array(LegacyControlUnitSchema),
  discardedSpecies: z.array(DiscardedSpeciesControlSchema),
  districtCode: stringOrUndefined,
  emitsAis: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  emitsVms: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  europeanFishingLicenceValid: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  externalReferenceNumber: stringOrUndefined,
  facade: stringOrUndefined,
  faoAreas: z.array(z.string()),
  flagState: stringOrUndefined,
  flightGoals: z.array(z.enum(MissionAction.FlightGoal)),
  gangwayPresentAndCompliant: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  gearOnboard: z.array(GearControlSchema),
  hasSomeGearsSeized: z.boolean(),
  hasSomeSpeciesSeized: z.boolean(),
  holdControlledAfterUnloading: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  id: z.number(),
  infractions: z.array(InfractionSchema),
  internalReferenceNumber: stringOrUndefined,
  ircs: stringOrUndefined,
  isAdministrativeControl: booleanOrUndefined,
  isComplianceWithWaterRegulationsControl: booleanOrUndefined,
  isFromPoseidon: booleanOrUndefined,
  isINNControl: z.boolean(),
  isLastHaul: z.boolean(),
  isSafetyEquipmentAndStandardsComplianceControl: booleanOrUndefined,
  isSeafarersControl: booleanOrUndefined,
  isUnitBoarded: booleanOrUndefined,
  latitude: numberOrUndefined,
  licencesAndLogbookObservations: stringOrUndefined,
  licencesMatchActivity: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  logbookMatchesActivity: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  logbookOpenedPriorToControl: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  longitude: numberOrUndefined,
  minimumConservationReferenceSizeControlled: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  missionId: z.number(),
  numberOfVesselsFlownOver: numberOrUndefined,
  observationsByUnit: stringOrUndefined,
  onboardWeighingPermit: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),

  otherComments: stringOrUndefined,

  portEntranceAndLandingAuthorized: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  portLocode: stringOrUndefined,
  // This field is added by the API
  portName: stringOrUndefined,
  propulsionEnginePowerControl: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  segments: z.array(FleetSegmentSchema),
  seizureAndDiversion: booleanOrUndefined,
  seizureAndDiversionComments: stringOrUndefined,
  separateStowageOfPreservedSpecies: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  speciesObservations: stringOrUndefined,
  speciesOnboard: z.array(SpeciesOnboardControlSchema),
  speciesQuantitySeized: numberOrUndefined,
  speciesSizeControlled: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  speciesWeightControlled: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  stowagePlanPresent: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  underSizedSeparateRecording: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  underSizedSeparateStowage: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  unitWithoutOmegaGauge: booleanOrUndefined,
  userTrigram: stringOrUndefined,
  vesselId: numberOrUndefined,
  vesselName: stringOrUndefined,
  vesselTargeted: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  vmsEmissionControlBeforeArrival: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  weighingCertificateAndSystemsValid: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  weighingOperationsMonitoredByInspectors: z.union([z.enum(MissionAction.ControlCheck), z.undefined()]),
  weightControlMethod: z.union([z.enum(MissionAction.WeightControlMethod), z.undefined()])
})
