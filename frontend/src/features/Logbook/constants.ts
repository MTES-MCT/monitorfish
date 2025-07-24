import { Logbook } from '@features/Logbook/Logbook.types'

export type LogbookMessageTypeLabel = {
  code: Logbook.MessageType
  displayCode: string
  fullName?: string
  isFilterable: boolean
  name: string
}

export const LogbookMessageType: Record<Logbook.MessageType, LogbookMessageTypeLabel> = {
  COE: {
    code: Logbook.MessageType.COE,
    displayCode: 'COE',
    fullName: "Entrée dans une zone d'effort",
    isFilterable: true,
    name: "Entrée dans une zone d'effort"
  },
  COX: {
    code: Logbook.MessageType.COX,
    displayCode: 'COX',
    fullName: "Sortie d'une zone d'effort",
    isFilterable: true,
    name: "Sortie d'une zone d'effort"
  },
  CPS: {
    code: Logbook.MessageType.CPS,
    displayCode: 'CPS',
    fullName: "Capture d'espèces protégées",
    isFilterable: true,
    name: "CAPTURES D'ESP. PROTÉGÉES"
  },
  CRO: {
    code: Logbook.MessageType.CRO,
    displayCode: 'CRO',
    fullName: "Traversée d'une zone d'effort",
    isFilterable: true,
    name: "Traversée d'une zone d'effort"
  },
  DEP: {
    code: Logbook.MessageType.DEP,
    displayCode: 'DEP',
    isFilterable: true,
    name: 'Départ'
  },
  DIM: {
    code: Logbook.MessageType.DIM,
    displayCode: 'DIM',
    isFilterable: false,
    name: 'Rejets minimis'
  },
  DIS: {
    code: Logbook.MessageType.DIS,
    displayCode: 'DIS',
    fullName: 'Déclaration de rejets',
    isFilterable: true,
    name: 'Rejets'
  },
  EOF: {
    code: Logbook.MessageType.EOF,
    displayCode: 'EOF',
    fullName: 'Fin de pêche',
    isFilterable: true,
    name: 'Fin de la marée'
  },
  FAR: {
    code: Logbook.MessageType.FAR,
    displayCode: 'FAR',
    fullName: 'Déclaration de capture',
    isFilterable: true,
    name: 'Captures'
  },
  'GEAR-RETRIEVAL': {
    code: Logbook.MessageType['GEAR-RETRIEVAL'],
    displayCode: 'RTV',
    fullName: "Sortie de l'eau d`engin",
    isFilterable: false,
    name: "Sortie de l'eau d`engin"
  },
  'GEAR-SHOT': {
    code: Logbook.MessageType['GEAR-SHOT'],
    displayCode: 'SHT',
    fullName: "Mise à l'eau d'engin",
    isFilterable: false,
    name: "Mise à l'eau d'engin"
  },
  INS: {
    code: Logbook.MessageType.INS,
    displayCode: 'INS',
    fullName: "Déclaration d'inspection",
    isFilterable: true,
    name: 'Inspection'
  },
  JFO: {
    code: Logbook.MessageType.JFO,
    displayCode: 'JFO',
    fullName: 'Opération de pêche conjointe',
    isFilterable: false,
    name: 'Opération de pêche conjointe'
  },
  LAN: {
    code: Logbook.MessageType.LAN,
    displayCode: 'LAN',
    fullName: 'Débarquement',
    isFilterable: true,
    name: 'Débarquement'
  },
  'NOT-COE': {
    code: Logbook.MessageType['NOT-COE'],
    displayCode: 'NOT-COE',
    fullName: "Notification d'entrée dans une zone d'effort",
    isFilterable: false,
    name: "Notification d'entrée dans une zone d'effort"
  },
  'NOT-COX': {
    code: Logbook.MessageType['NOT-COX'],
    displayCode: 'NOT-COX',
    fullName: "Notification de sortie d'une zone d'effort",
    isFilterable: false,
    name: "Notification de sortie d'une zone d'effort"
  },
  'NOT-TRA': {
    code: Logbook.MessageType['NOT-TRA'],
    displayCode: 'NOT-TRA',
    fullName: 'Notification de transbordement',
    isFilterable: false,
    name: 'Notification de transbordement'
  },
  PNO: {
    code: Logbook.MessageType.PNO,
    displayCode: 'PNO',
    fullName: 'Préavis (notification de retour au port)',
    isFilterable: true,
    name: 'Préavis'
  },
  PNT: {
    code: Logbook.MessageType.PNT,
    displayCode: 'PNT',
    fullName: 'Pré-notification de transfert',
    isFilterable: true,
    name: 'Pré-notification de transfert'
  },
  RLC: {
    code: Logbook.MessageType.RLC,
    displayCode: 'RLC',
    fullName: 'Déclaration de transfert',
    isFilterable: true,
    name: 'Transfert'
  },
  RTP: {
    code: Logbook.MessageType.RTP,
    displayCode: 'RTP',
    fullName: 'Retour au port',
    isFilterable: true,
    name: 'Retour au port'
  },
  'START-ACTIVITY': {
    code: Logbook.MessageType['START-ACTIVITY'],
    displayCode: 'STA',
    fullName: "Début d'activité de pêche",
    isFilterable: false,
    name: "Début d'activité de pêche"
  },
  'START-FISHING': {
    code: Logbook.MessageType['START-FISHING'],
    displayCode: 'STF',
    fullName: 'Début de pêche',
    isFilterable: false,
    name: 'Début de pêche'
  },
  TRA: {
    code: Logbook.MessageType.TRA,
    displayCode: 'TRA',
    fullName: 'Déclaration de transbordement',
    isFilterable: true,
    name: 'Transbordement'
  },
  TRZ: {
    code: Logbook.MessageType.TRZ,
    displayCode: 'TRZ',
    fullName: 'Pêche trans-zone',
    isFilterable: true,
    name: 'Pêche trans-zone'
  }
}

export const LogbookOperationType = {
  COR: 'COR',
  DAT: 'DAT'
}

export const LogbookMessageActivityType = {
  FSH: 'Pêche'
}

export const LogbookMessageSender = {
  MAS: 'Capitaine'
}

export const LogbookSpeciesPreservationState = {
  ALI: 'Vivant',
  BOI: 'Ébouillanté',
  DRI: 'Séché',
  FRE: 'Frais',
  FRO: 'Congelé',
  SAL: 'Salé'
}

export const LogbookProtectedSpeciesSex = {
  F: 'Mâle',
  M: 'Femelle'
}

export const LogbookProtectedSpeciesHealthState = {
  ALI: 'Vivant',
  DEA: 'Mort',
  INJ: 'Blessé'
}

export const LogbookProtectedSpeciesFate = {
  DEA: 'Corps mort ramené pour analyse',
  DIS: 'Rejeté',
  HEC: 'Ramené dans un centre de soin'
}

export const LogbookSpeciesPresentation = {
  CBF: 'Double filet de cabillaud avec peau (escalado)',
  CLA: 'Pinces',
  DWT: 'Code CICTA',
  FIL: 'En filets',
  FIS: 'En filets et filets sans peau',
  FSB: 'En filets avec peau et arêtes',
  FSP: 'En filets dépouillé avec arête intramusculaire',
  GHT: 'Éviscéré étêté et équeuté',
  GUG: 'Éviscéré et sans branchies',
  GUH: 'Éviscéré et étêté',
  GUL: 'Éviscéré avec le foie',
  GUS: 'Éviscéré étêté et sans peau',
  GUT: 'Éviscéré',
  HEA: 'Étêté',
  JAP: 'Découpe japonaise',
  JAT: 'Découpe japonaise et équeuté',
  LAP: 'Lappen',
  LVR: 'Foie',
  'LVR-C': 'Foie',
  OTH: 'Autres',
  ROE: 'Œuf(s)',
  'ROE-C': 'Œuf(s)',
  SAD: 'Salé à sec',
  SAL: 'Légèrement salé en saumure',
  SGH: 'Salé éviscéré et étêté',
  SGT: 'Salé et éviscéré',
  SKI: 'Dépouillé',
  SUR: 'Surimi',
  TAL: 'Queue',
  TLD: 'Équeuté',
  TNG: 'Langue',
  TUB: 'Corps cylindrique uniquement',
  WHL: 'Entier',
  WNG: 'Ailerons'
}

export enum NavigateTo {
  EQUALS = 'EQUALS',
  LAST = 'LAST',
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS'
}

export enum LogbookSoftware {
  FPP = 'FPP',
  JPE = 'JPE',
  JPP = 'JPP',
  NONE = 'NONE',
  VIS = 'VIS'
}

export const LogbookSoftwareLabel: Record<LogbookSoftware, string> = {
  [LogbookSoftware.JPE]: 'Messages issus du journal de pêche électronique',
  [LogbookSoftware.JPP]: 'Messages issus du journal de pêche papier',
  [LogbookSoftware.FPP]: 'Messages issus de fiches de pêche papier',
  [LogbookSoftware.VIS]: 'Messages issus de VisioCaptures',
  [LogbookSoftware.NONE]: 'Inconnu'
}
