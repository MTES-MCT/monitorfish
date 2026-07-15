import { Icon } from '@mtes-mct/monitor-ui'

import { getApplicabilityByFieldName } from './getSpeciesEISRApplicability'
import { WEIGHT_CONTROL_METHOD_AS_OPTIONS } from '../constants'

import type { SpeciesEISRApplicability } from './getSpeciesEISRApplicability'
import type { ControlCheckRow } from '../ControlCheckTable'

const BASE_SPECIES_CHECK_ROWS: ControlCheckRow[] = [
  { isRequired: true, label: 'Poids des espèces vérifiés', name: 'speciesWeightControlled' },
  { isRequired: true, label: 'Taille des espèces vérifiées', name: 'speciesSizeControlled' },
  {
    isRequired: true,
    label: (
      <>
        Arrimage séparé des espèces soumises à plan{' '}
        <Icon.Info size={16} title="concernés : espèces démersales / SWO / BFT" />
      </>
    ),
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
    label: 'Type de contrôle du poids',
    name: 'weightControlMethod',
    selectOptions: WEIGHT_CONTROL_METHOD_AS_OPTIONS
  },
  { isRequired: true, label: 'Cale contrôlée après déchargement', name: 'holdControlledAfterUnloading' },
  {
    isRequired: true,
    label: 'Suivi des opérations de pesée par les inspecteurs',
    name: 'weighingOperationsMonitoredByInspectors'
  }
]

// Rendered below the species table, only when at least one species is marked as not landed.
const LAND_CONTROL_NOT_LANDED_CHECK_ROWS: ControlCheckRow[] = [
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

function disableNonApplicableRows(rows: ControlCheckRow[], applicability: SpeciesEISRApplicability): ControlCheckRow[] {
  const isRowApplicable = getApplicabilityByFieldName(applicability)

  return rows.map(row =>
    row.name in isRowApplicable && !isRowApplicable[row.name] ? Object.assign({}, row, { disabled: true }) : row
  )
}

export function getSpeciesControlCheckRows(
  isLandControl: boolean,
  isEISREnabled: boolean,
  applicability: SpeciesEISRApplicability
): ControlCheckRow[] {
  if (!isEISREnabled) {
    return BASE_SPECIES_CHECK_ROWS
  }

  const rows = isLandControl
    ? LAND_CONTROL_EISR_CHECK_ROWS
    : [...BASE_SPECIES_CHECK_ROWS, ...SEA_CONTROL_EISR_CHECK_ROWS]

  return disableNonApplicableRows(rows, applicability)
}

export function getLandControlNotLandedCheckRows(applicability: SpeciesEISRApplicability): ControlCheckRow[] {
  return disableNonApplicableRows(LAND_CONTROL_NOT_LANDED_CHECK_ROWS, applicability)
}
