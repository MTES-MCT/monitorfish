import { Inquiry } from '@features/Inquiry/Inquiry.types'

export const INQUIRY_ORIGIN_LABEL: Record<Inquiry.InquiryOrigin, string> = {
  [Inquiry.InquiryOrigin.CNSP_REPORTING]: 'signalement CNSP',
  [Inquiry.InquiryOrigin.FOLLOW_UP_CONTROL]: 'suite d’un contrôle physique (mer, terre)',
  [Inquiry.InquiryOrigin.OPPORTUNITY_CONTROL]: 'contrôle d’opportunité',
  [Inquiry.InquiryOrigin.OTHER_REPORTING]: 'autre signalement',
  [Inquiry.InquiryOrigin.URCEM_DEDICATED_STATION]: 'poste dédié aux contrôles croisés (URCEM)'
}

export const INQUIRY_CONTROL_TYPE_LABEL: Record<Inquiry.InquiryControlType, string> = {
  [Inquiry.InquiryControlType.ADMINISTRATIVE]: 'Contrôle administratif navire',
  [Inquiry.InquiryControlType.FISHING_REPORTING_OBLIGATION]:
    'Obligations déclaratives pêche (certificats, licences, pesées...)',
  [Inquiry.InquiryControlType.GENS_DE_MER]: 'Contrôle administratif gens de mer',
  [Inquiry.InquiryControlType.INN_ACTIVITY]:
    'Activités INN (pêche non conforme à l’autorisation par navire tiers, navire sans immatriculation...)',
  [Inquiry.InquiryControlType.LANDING_OBLIGATION]: 'Obligation de débarquement (rejets...)',
  [Inquiry.InquiryControlType.NAVIGATION]: 'Respect des règles de navigation',
  [Inquiry.InquiryControlType.OTHER]: 'Autre',
  [Inquiry.InquiryControlType.SECTOR]: 'Filière (traçabilité, certificat, note de vente, vente sous-taille...)',
  [Inquiry.InquiryControlType.SECURITY]: 'Équipements et respect des normes de sécurité',
  [Inquiry.InquiryControlType.TECHNICAL_MEASURE]:
    'Mesures techniques et de conservation (engins, espèces interdites, surquota, période, zone interdite...)',
  [Inquiry.InquiryControlType.TRANSPORT]: 'Transport'
}

export const INQUIRY_INFRACTION_TYPE_LABEL: Record<Inquiry.InquiryInfractionType, string> = {
  [Inquiry.InquiryInfractionType.WAITING]: 'En attente',
  [Inquiry.InquiryInfractionType.WITH_REPORT]: 'Avec PV',
  [Inquiry.InquiryInfractionType.WITHOUT_REPORT]: 'Sans PV'
}
