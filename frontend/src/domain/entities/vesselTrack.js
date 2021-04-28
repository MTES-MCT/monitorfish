export const trackTypes = {
  TRANSIT: {
    code: 'TRANSIT',
    color: '#3A9885',
    arrow: 'arrow_green.png',
    description: 'En transit (vitesse > 6 Nds)'
  },
  SEARCHING: {
    code: 'SEARCHING',
    color: '#C08416',
    arrow: 'arrow_yellow.png',
    description: 'En recherche de pêche (vitesse entre 3 et 6 Nds)'
  },
  FISHING: {
    code: 'FISHING',
    color: '#05055E',
    arrow: 'arrow_blue.png',
    description: 'En pêche (vitesse < 3 Nds)'
  }
}

export function getTrackTypeFromSpeed (speed) {
  if (speed >= 0 && speed <= 3) {
    return trackTypes.FISHING
  } else if (speed > 3 && speed <= 6) {
    return trackTypes.SEARCHING
  } else {
    return trackTypes.TRANSIT
  }
}
