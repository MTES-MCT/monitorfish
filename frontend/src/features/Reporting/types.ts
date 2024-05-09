import { ReportingType } from '../../domain/types/reporting'

type ReportingTypeCharacteristic = {
  // TODO It should be useless now that types are discriminated.
  code: ReportingType
  inputName: string | null
  // TODO This should be named differently to avoid confusion with `ReportingType.INFRACTION_SUSPICION` type.
  isInfractionSuspicion: boolean
  name: string
}

export const ReportingTypeCharacteristics: Record<ReportingType, ReportingTypeCharacteristic> = {
  ALERT: {
    code: ReportingType.ALERT,
    inputName: null,
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
export const ReportingOriginActor = {
  OPS: {
    code: 'OPS',
    name: 'OPS'
  },
  SIP: {
    code: 'SIP',
    name: 'SIP'
  },
  UNIT: {
    code: 'UNIT',
    name: 'Unité'
  },
  DML: {
    code: 'DML',
    name: 'DML'
  },
  DIRM: {
    code: 'DIRM',
    name: 'DIRM'
  },
  OTHER: {
    code: 'OTHER',
    name: 'Autre'
  }
}
/* eslint-enable sort-keys-fix/sort-keys-fix */
