import type { ControlCheckRow } from '../ControlCheckTable'

const BASE_SPECIES_CHECK_ROWS: ControlCheckRow[] = [
  { isRequired: true, label: 'Poids des espèces vérifiés', name: 'speciesWeightControlled' },
  { isRequired: true, label: 'Taille des espèces vérifiées', name: 'speciesSizeControlled' },
  {
    isRequired: true,
    label: 'Arrimage séparé des espèces soumises à plan',
    name: 'separateStowageOfPreservedSpecies'
  }
]

const LAND_CONTROL_EISR_CHECK_ROWS: ControlCheckRow[] = [
  {
    isSectionHeader: true,
    label: (
      <>
        Pour les captures <u>débarquées</u>
      </>
    ),
    name: 'unloadedSection'
  },
  {
    isRequired: true,
    label: 'Taille minimale de référence de conservation contrôlée',
    name: 'minimumConservationReferenceSizeControlled'
  },
  {
    isRequired: true,
    label: 'Contrôle de pesée / décompte des caisses / échantillonnage',
    name: 'cratesWeighingSamplingControl'
  },
  {
    isRequired: true,
    label: "Informations sur l'opérateur de pesée agréé",
    name: 'approvedWeighingOperatorInformation'
  },
  { isRequired: true, label: 'Cale contrôlée après déchargement', name: 'holdControlledAfterUnloading' },
  { isRequired: true, label: 'Pesée des captures lors du débarquement', name: 'catchesWeighedAtLanding' },
  {
    isSectionHeader: true,
    label: (
      <>
        Pour les captures <u>non débarquées</u>
      </>
    ),
    name: 'heldOnboardSection'
  },
  {
    isRequired: true,
    label: "Enregistrement séparé des poissons n'ayant pas la taille requise",
    name: 'underSizedSeparateRecording'
  }
]

const SEA_CONTROL_EISR_CHECK_ROWS: ControlCheckRow[] = [
  {
    isRequired: true,
    label: "Arrimage séparé des poissons n'ayant pas la taille requise",
    name: 'underSizedSeparateStowage'
  },
  {
    isRequired: true,
    label: "Enregistrement séparé des poissons n'ayant pas la taille requise",
    name: 'underSizedSeparateRecording'
  }
]

export function getSpeciesControlCheckRows(isLandControl: boolean, isEISREnabled: boolean): ControlCheckRow[] {
  if (isLandControl) {
    return isEISREnabled ? LAND_CONTROL_EISR_CHECK_ROWS : BASE_SPECIES_CHECK_ROWS
  }

  return isEISREnabled ? [...BASE_SPECIES_CHECK_ROWS, ...SEA_CONTROL_EISR_CHECK_ROWS] : BASE_SPECIES_CHECK_ROWS
}
