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
    name: 'Débarquement'
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
    name: 'Entrée dans une zone d\'effort'
  },
  COX: {
    code: 'COX',
    name: 'Sortie d\'une zone d\'effort'
  },
  CRO: {
    code: 'CRO',
    name: 'Traversée d\'une zone d\'effort'
  },
  DIS: {
    code: 'DIS',
    name: 'Rejets'
  },
  DIM: {
    code: 'DIM',
    name: 'Rejets minimis'
  }
}

export const ERSMessageActivityType = {
  FSH: 'Pêche'
}

export const ERSMessageSender = {
  MAS: 'Capitaine'
}

export const ERSMessagePNOPurposeType = {
  LAN: 'Débarquement'
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

function getPropertiesObject (ersCatch) {
  return {
    faoZone: ersCatch.faoZone,
    conversionFactor: ersCatch.conversionFactor,
    packaging: ersCatch.packaging,
    effortZone: ersCatch.effortZone,
    presentation: ersCatch.presentation,
    economicZone: ersCatch.economicZone,
    preservationState: ersCatch.preservationState,
    statisticalRectangle: ersCatch.statisticalRectangle
  }
}

export const buildCatchArray = catches => {
  const notFound = -1

  return catches.reduce((accumulator, ersCatch) => {
    const sameSpeciesIndex = accumulator.findIndex(accCatch => {
      return accCatch.species === ersCatch.species
    })

    if (sameSpeciesIndex === notFound) {
      accumulator.push({
        species: ersCatch.species,
        speciesName: ersCatch.speciesName,
        weight: ersCatch.weight ? ersCatch.weight : 0,
        properties: [
          getPropertiesObject(ersCatch)
        ]
      })
    } else {
      const foundPropertyIndex = accumulator[sameSpeciesIndex].properties.findIndex(property => {
        return property.faoZone === ersCatch.faoZone &&
                    property.conversionFactor === ersCatch.conversionFactor &&
                    property.effortZone === ersCatch.effortZone &&
                    property.economicZone === ersCatch.economicZone &&
                    property.preservationState === ersCatch.preservationState &&
                    property.statisticalRectangle === ersCatch.statisticalRectangle &&
                    property.presentation === ersCatch.presentation
      })

      if (foundPropertyIndex === notFound) {
        accumulator[sameSpeciesIndex].properties.push(getPropertiesObject(ersCatch))
      } else {
        accumulator[sameSpeciesIndex].weight += ersCatch.weight ? parseFloat(ersCatch.weight) : 0
      }
    }

    return accumulator
  }, [])
}
