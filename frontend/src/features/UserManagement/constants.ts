import { getOptionsFromLabelledEnum } from '@mtes-mct/monitor-ui'

import { UserManagement } from './types'

export const EXTERNAL_ADMINISTRATION_LABEL: Record<UserManagement.ExternalAdministration, string> = {
  [UserManagement.ExternalAdministration.DOUANE]: 'Douane',
  [UserManagement.ExternalAdministration.GENDARMERIE_MARITIME]: 'Gendarmerie maritime',
  [UserManagement.ExternalAdministration.GENDARMERIE_NATIONALE]: 'Gendarmerie nationale'
}
export const EXTERNAL_ADMINISTRATION_AS_OPTIONS = getOptionsFromLabelledEnum(EXTERNAL_ADMINISTRATION_LABEL)

export const INACTIVITY_DELAY_IN_MONTHS = 6

export const ACTIVITY_LABEL: Record<UserManagement.Activity, string> = {
  [UserManagement.Activity.INACTIVE]: `Inactifs depuis ${INACTIVITY_DELAY_IN_MONTHS} mois ou jamais connectés`,
  [UserManagement.Activity.NEVER_LOGGED_IN]: 'Jamais connectés'
}
export const ACTIVITY_AS_OPTIONS = getOptionsFromLabelledEnum(ACTIVITY_LABEL)

export const TAB_LABEL: Record<UserManagement.Tab, string> = {
  [UserManagement.Tab.USERS]: 'Utilisateurs',
  [UserManagement.Tab.AUTHORIZED_ORGANIZATIONAL_UNITS]: 'Unités organisationnelles autorisées (Cerbère)'
}

export const USER_TYPE_LABEL: Record<UserManagement.UserType, string> = {
  [UserManagement.UserType.CNSP]: 'CNSP',
  [UserManagement.UserType.EXTERNAL]: 'Externe'
}
export const USER_TYPE_AS_OPTIONS = getOptionsFromLabelledEnum(USER_TYPE_LABEL)
