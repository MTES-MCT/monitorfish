export const ERSMessageType = {
    DEP: {
        code: 'DEP',
        name: 'Départ'
    },
    FAR: {
        code: 'FAR',
        name: 'Captures'
    },
    PNO: {
        code: 'PNO',
        name: 'Préavis'
    },
    LAN: {
        code: 'LAN',
        name: ''
    },
    RTP: {
        code: 'RTP',
        name: 'Retour au port'
    },
    EOF: {
        code: 'EOF',
        name: 'Fin de la marée'
    },
    COE: {
        code: 'COE',
        name: '',
    },
    COX: {
        code: 'COX',
        name: ''
    },
    DIS: {
        code: 'DIS',
        name: 'Rejets'
    },
    DIM: {
        code: 'DIM',
        name: 'Rejets minimis'
    },
}

export const ERSMessageActivityType = {
    FSH: 'Pêche',
}

export const ERSMessagePNOPurposeType = {
    LAN: 'Débarquement',
}

export const ERSSpeciesPreservationState = {
    ALI: 'Vivant',
    BOI: 'Ébouillanté',
    DRI: 'Séché',
    FRE: 'Frais',
    FRO: 'Congelé',
    SAL: 'Salé'
}

export const ERSSpeciesPresentation = {
    CBF : "Double filet de cabillaud avec peau (escalado)",
    CLA : "Pinces",
    DWT : "Code CICTA",
    FIL : "En filets",
    FIS : "En filets et filets sans peau",
    FSB : "En filets avec peau et arêtes",
    FSP : "En filets dépouillé avec arête intramusculaire",
    GHT : "Éviscéré étêté et équeuté",
    GUG : "Éviscéré et sans branchies",
    GUH : "Éviscéré et étêté",
    GUL : "Éviscéré avec le foie",
    GUS : "Éviscéré étêté et sans peau",
    GUT : "Éviscéré",
    HEA : "Étêté",
    JAP : "Découpe japonaise",
    JAT : "Découpe japonaise et équeuté",
    LAP : "Lappen",
    LVR : "Foie",
    OTH : "Autres",
    ROE : "Œuf(s)",
    SAD : "Salé à sec",
    SAL : "Légèrement salé en saumure",
    SGH : "Salé éviscéré et étêté",
    SGT : "Salé et éviscéré",
    SKI : "Dépouillé",
    SUR : "Surimi",
    TAL : "Queue",
    TLD : "Équeuté",
    TNG : "Langue",
    TUB : "Corps cylindrique uniquement",
    WHL : "Entier",
    WNG : "Ailerons",
}

// TODO Finir les associations