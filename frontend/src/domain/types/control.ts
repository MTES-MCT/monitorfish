export type Infraction = {
  infraction: string
  infractionCategory: string
  natinfCode: string
  regulation: string
}

export type GearControl = {
  controlledMesh: number
  declaredMesh: number
  gearCode: string
  gearName: string
  gearWasControlled: boolean
}

export type Controller = {
  administration: string
  controller: string
  controllerType: string
}

export type VesselControl = {
  cnspCalledUnit: boolean
  controlDatetimeUtc: string
  controlType: string
  controller: Controller
  cooperative: boolean
  diversion: boolean
  escortToQuay: boolean
  facade: string
  gearControls: GearControl[]
  infraction: boolean
  infractions: Infraction[]
  inputEndDatetimeUtc: string
  inputStartDatetimeUtc: string
  latitude: string
  longitude: string
  missionOrder: string
  portLocode: string
  portName: string
  postControlComments: string
  preControlComments: string
  seizure: boolean
  seizureComments: string
  vesselTargeted: boolean
}

export type ControlSummary = {
  controls: VesselControl[]
  numberOfAerialControls: number
  numberOfDiversions: number
  numberOfEscortsToQuay: number
  numberOfFishingInfractions: number
  numberOfLandControls: number
  numberOfSeaControls: number
  numberOfSecurityInfractions: number
  numberOfSeizures: number
  vesselId: number
}

// TODO Check that these comments are not some sort of enum value.
export type LastControls = {
  // Contrôle à la débarque
  LAND: ControlAndText
  // Contrôle_en_mer
  SEA: ControlAndText
}

export type ControlAndText = {
  control: VesselControl
  text: string
}
