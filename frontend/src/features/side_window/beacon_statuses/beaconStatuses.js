export const BeaconStatusesSubMenu = {
  PAIRING: {
    name: 'Apparaige des balises',
    code: 'PAIRING'
  },
  MALFUNCTIONING: {
    name: 'Avaries VMS en cours',
    code: 'MALFUNCTIONING'
  },
  HISTORIC: {
    name: 'Historique des avaries',
    code: 'MED'
  }
}

export const beaconStatusesStages = {
  INITIAL_ENCOUNTER: {
    code: 'INITIAL_ENCOUNTER',
    title: 'Premier contact',
    description: 'Obtenir une réponse des navires qui ont cessé d\'émettre.'
  },
  FOUR_HOUR_REPORT: {
    code: 'FOUR_HOUR_REPORT',
    title: '4h report',
    description: 'Suivre les navires qui font leurs 4h report ou les relancer s\'ils l\'ont cessé.'
  },
  RELAUNCH_REQUEST: {
    code: 'RELAUNCH_REQUEST',
    title: 'Relance pour reprise',
    description: 'Relancer les navires qui sont à quai (ou supposés à quai) et qui n\'ont pas encore repris leurs émissions.'
  },
  TARGETING_VESSEL: {
    code: 'TARGETING_VESSEL',
    title: 'Ciblage du navire',
    description: 'Mobiliser les unités sur les navires dont on n\'a pas de nouvelles et/ou qui sont actifs en mer sans VMS.'
  },
  CROSS_CHECK: {
    code: 'CROSS_CHECK',
    title: 'Contrôle croisé',
    description: 'Mobiliser les unités sur les navires dont on n\'a pas de nouvelles et/ou qui sont actifs en mer sans VMS.'
  },
  RESUMED_TRANSMISSION: {
    code: 'RESUMED_TRANSMISSION',
    title: 'Reprise des émissions',
    description: 'Envoyer un message de reprise aux unités dont les émissions ont repris.'
  }
}
