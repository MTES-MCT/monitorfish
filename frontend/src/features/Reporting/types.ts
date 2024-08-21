import { ReportingType } from '../../domain/types/reporting'

type ReportingTypeCharacteristic = {
  // TODO It should be useless now that types are discriminated.
  code: ReportingType
  inputName: string
  // TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
  isInfractionSuspicion: boolean
  name: string
}

export const ReportingTypeCharacteristics: Record<ReportingType, ReportingTypeCharacteristic> = {
  ALERT: {
    code: ReportingType.ALERT,
    inputName: '',
    isInfractionSuspicion: true,
    name: 'ALERTE'
  },
  INFRACTION_SUSPICION: {
    code: ReportingType.INFRACTION_SUSPICION,
    inputName: 'Infraction (suspicion)',
    isInfractionSuspicion: true,
    name: "SUSPICION d'INFRACTION"
  },
  OBSERVATION: {
    code: ReportingType.OBSERVATION,
    inputName: 'Observation',
    isInfractionSuspicion: false,
    name: 'OBSERVATION'
  }
}

/**
 * We keep this order as it define the form option inputs order
 */
/* eslint-disable sort-keys-fix/sort-keys-fix */
export enum ReportingOriginActor {
  DIRM = 'DIRM',
  DML = 'DML',
  OPS = 'OPS',
  OTHER = 'OTHER',
  SIP = 'SIP',
  UNIT = 'UNIT'
}

export const ReportingOriginActorLabel: Record<ReportingOriginActor, string> = {
  OPS: 'OPS',
  SIP: 'SIP',
  UNIT: 'Unité',
  DML: 'DML',
  DIRM: 'DIRM',
  OTHER: 'Autre'
}
/* eslint-enable sort-keys-fix/sort-keys-fix */
