export const LogbookMessageType = {
  COE: {
    code: 'COE',
    displayCode: 'COE',
    fullName: "Entrée dans une zone d'effort",
    name: "Entrée dans une zone d'effort"
  },
  COX: {
    code: 'COX',
    displayCode: 'COX',
    fullName: "Sortie d'une zone d'effort",
    name: "Sortie d'une zone d'effort"
  },
  CRO: {
    code: 'CRO',
    displayCode: 'CRO',
    fullName: "Traversée d'une zone d'effort",
    name: "Traversée d'une zone d'effort"
  },
  DEP: {
    code: 'DEP',
    displayCode: 'DEP',
    name: 'Départ'
  },
  DIM: {
    code: 'DIM',
    displayCode: 'DIM',
    name: 'Rejets minimis'
  },
  DIS: {
    code: 'DIS',
    displayCode: 'DIS',
    fullName: 'Déclaration de rejets',
    name: 'Rejets'
  },
  EOF: {
    code: 'EOF',
    displayCode: 'EOF',
    fullName: 'Fin de pêche',
    name: 'Fin de la marée'
  },
  FAR: {
    code: 'FAR',
    displayCode: 'FAR',
    fullName: 'Déclaration de capture',
    name: 'Captures'
  },
  GEAR_RETRIEVAL: {
    code: 'GEAR_RETRIEVAL',
    displayCode: 'RTV',
    fullName: "Sortie de l'eau d`engin",
    name: "Sortie de l'eau d`engin"
  },
  GEAR_SHOT: {
    code: 'GEAR_SHOT',
    displayCode: 'SHT',
    fullName: "Mise à l'eau d'engin",
    name: "Mise à l'eau d'engin"
  },
  INS: {
    code: 'INS',
    displayCode: 'INS',
    fullName: "Déclaration d'inspection",
    name: 'Inspection'
  },
  JFO: {
    code: 'JFO',
    displayCode: 'JFO',
    fullName: 'Opération de pêche conjointe',
    name: 'Opération de pêche conjointe'
  },
  LAN: {
    code: 'LAN',
    displayCode: 'LAN',
    fullName: 'Débarquement',
    name: 'Débarquement'
  },
  NOT_COE: {
    code: 'NOT_COE',
    displayCode: 'COE',
    fullName: "Notification d'entrée dans une zone d'effort",
    name: "Notification d'entrée dans une zone d'effort"
  },
  NOT_COX: {
    code: 'NOT_COX',
    displayCode: 'COX',
    fullName: "Notification de sortie d'une zone d'effort",
    name: "Notification de sortie d'une zone d'effort"
  },
  NOT_TRA: {
    code: 'NOT_TRA',
    displayCode: 'TRA',
    fullName: 'Notification de transbordement',
    name: 'Notification de transbordement'
  },
  PNO: {
    code: 'PNO',
    displayCode: 'PNO',
    fullName: 'Préavis (notification de retour au port)',
    name: 'Préavis'
  },
  PNT: {
    code: 'PNT',
    displayCode: 'PNT',
    fullName: 'Pré-notification de transfert',
    name: 'Pré-notification de transfert'
  },
  RLC: {
    code: 'RLC',
    displayCode: 'RLC',
    fullName: 'Déclaration de transfert',
    name: 'Transfert'
  },
  RTP: {
    code: 'RTP',
    displayCode: 'RTP',
    fullName: 'Retour au port',
    name: 'Retour au port'
  },
  START_ACTIVITY: {
    code: 'START_ACTIVITY',
    displayCode: 'STA',
    fullName: "Début d'activité de pêche",
    name: "Début d'activité de pêche"
  },
  START_FISHING: {
    code: 'START_FISHING',
    displayCode: 'STF',
    fullName: 'Début de pêche',
    name: 'Début de pêche'
  },
  TRA: {
    code: 'TRA',
    displayCode: 'TRA',
    fullName: 'Déclaration de transbordement',
    name: 'Transbordement'
  },
  TRZ: {
    code: 'TRZ',
    displayCode: 'TRZ',
    fullName: 'Pêche trans-zone',
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

export const LogbookMessagePNOPurposeType = {
  LAN: 'Débarquement',
  SHE: "Mise à l'abri"
}

export const LogbookSpeciesPreservationState = {
  ALI: 'Vivant',
  BOI: 'Ébouillanté',
  DRI: 'Séché',
  FRE: 'Frais',
  FRO: 'Congelé',
  SAL: 'Salé'
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
  OTH: 'Autres',
  ROE: 'Œuf(s)',
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
  LAST = 'LAST',
  NEXT = 'NEXT',
  PREVIOUS = 'PREVIOUS'
}
