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
  [UserManagement.Tab.AUTHORIZED_ORGANIZATIONAL_UNITS]: 'Services autorisés (Cerbère)'
}
export const TAB_AS_OPTIONS = getOptionsFromLabelledEnum(TAB_LABEL)

export const USER_TYPE_LABEL: Record<UserManagement.UserType, string> = {
  [UserManagement.UserType.CNSP]: 'CNSP',
  [UserManagement.UserType.EXTERNAL]: 'Externe'
}
export const USER_TYPE_AS_OPTIONS = getOptionsFromLabelledEnum(USER_TYPE_LABEL)

export const AUTHORIZATION_AUDIT_ACTION_LABEL: Record<UserManagement.AuthorizationAuditAction, string> = {
  [UserManagement.AuthorizationAuditAction.ADD_AUTHORIZED_ORGANIZATIONAL_UNIT]: 'Ajout d’un service autorisé',
  [UserManagement.AuthorizationAuditAction.ADD_USER]: 'Ajout d’un utilisateur',
  [UserManagement.AuthorizationAuditAction.DELETE_AUTHORIZED_ORGANIZATIONAL_UNIT]: 'Suppression d’un service autorisé',
  [UserManagement.AuthorizationAuditAction.DELETE_USER]: 'Suppression d’un utilisateur',
  [UserManagement.AuthorizationAuditAction.REPLACE_ADMINISTRATION_USERS]: 'Import de la liste d’une administration',
  [UserManagement.AuthorizationAuditAction.UPDATE_USER_IS_ADMINISTRATOR]: 'Modification des droits d’administrateur'
}
export const AUTHORIZATION_AUDIT_ACTION_AS_OPTIONS = getOptionsFromLabelledEnum(AUTHORIZATION_AUDIT_ACTION_LABEL)

export const API_KEY_ACTOR_LABEL = 'API (clé d’API)'
