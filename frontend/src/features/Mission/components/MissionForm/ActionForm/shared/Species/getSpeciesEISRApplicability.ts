import { ScipSpeciesType } from '@features/FleetSegment/types'
import { MissionAction } from '@features/Mission/missionAction.types'

import {
  BLUEFIN_TUNA_SPECY_CODE,
  SEPARATE_STOWAGE_MIN_VESSEL_LENGTH_METERS,
  SMALL_PELAGICS_SHARE_THRESHOLD,
  SMALL_PELAGIC_SPECIES_CODES,
  SWORDFISH_SPECY_CODE,
  UNDER_SIZED_SEPARATE_RECORDING_MIN_VESSEL_LENGTH_METERS,
  UNDER_SIZED_SEPARATE_STOWAGE_MIN_VESSEL_LENGTH_METERS
} from './speciesEISRVisibility.constants'

export type ScipSpeciesTypeLookup = (speciesCode: string) => ScipSpeciesType | undefined

export type SpeciesEISRApplicability = {
  isSeparateStowageOfPreservedSpeciesApplicable: boolean
  isUnderSizedSeparateRecordingApplicable: boolean
  isUnderSizedSeparateStowageApplicable: boolean
}

// Before a vessel is selected there is no species/length data to decide anything from — default
// to applicable, the same conservative stance taken for an unknown vessel length.
export const DEFAULT_SPECIES_EISR_APPLICABILITY: SpeciesEISRApplicability = {
  isSeparateStowageOfPreservedSpeciesApplicable: true,
  isUnderSizedSeparateRecordingApplicable: true,
  isUnderSizedSeparateStowageApplicable: true
}

export function hasDemersalSpeciesOnboard(
  speciesOnboard: MissionAction.SpeciesOnboardControl[] | undefined,
  getScipSpeciesTypeFromSpecyCode: ScipSpeciesTypeLookup
): boolean {
  return (speciesOnboard ?? []).some(
    species => getScipSpeciesTypeFromSpecyCode(species.speciesCode) === ScipSpeciesType.DEMERSAL
  )
}

export function hasBftOrSwoOnboard(speciesOnboard: MissionAction.SpeciesOnboardControl[] | undefined): boolean {
  return (speciesOnboard ?? []).some(
    species => species.speciesCode === BLUEFIN_TUNA_SPECY_CODE || species.speciesCode === SWORDFISH_SPECY_CODE
  )
}

/** Returns `undefined` when there is no weighed catch at all onboard (nothing to divide by),
 *  in which case callers should treat the share as "not proven to be ≥ the threshold". */
export function getSmallPelagicsShare(
  speciesOnboard: MissionAction.SpeciesOnboardControl[] | undefined
): number | undefined {
  const totalWeight = (speciesOnboard ?? []).reduce(
    (sum, species) => sum + (species.controlledWeight ?? species.declaredWeight ?? 0),
    0
  )
  if (totalWeight === 0) {
    return undefined
  }

  const smallPelagicsWeight = (speciesOnboard ?? [])
    .filter(species => SMALL_PELAGIC_SPECIES_CODES.includes(species.speciesCode))
    .reduce((sum, species) => sum + (species.controlledWeight ?? species.declaredWeight ?? 0), 0)

  return smallPelagicsWeight / totalWeight
}

export function isSeparateStowageOfPreservedSpeciesApplicable(
  speciesOnboard: MissionAction.SpeciesOnboardControl[] | undefined,
  getScipSpeciesTypeFromSpecyCode: ScipSpeciesTypeLookup,
  vesselLength: number | undefined
): boolean {
  const isLongEnough = vesselLength === undefined || vesselLength >= SEPARATE_STOWAGE_MIN_VESSEL_LENGTH_METERS
  const isDemersalAndLongEnough =
    hasDemersalSpeciesOnboard(speciesOnboard, getScipSpeciesTypeFromSpecyCode) && isLongEnough

  return isDemersalAndLongEnough || hasBftOrSwoOnboard(speciesOnboard)
}

// All vessels >= 12m are subject to this obligation, unless more than 80% of the catch onboard is
// small pelagics — vessels < 12m are never subject to it.
export function isUnderSizedSeparateStowageApplicable(
  speciesOnboard: MissionAction.SpeciesOnboardControl[] | undefined,
  vesselLength: number | undefined
): boolean {
  if (vesselLength === undefined) {
    return true
  }

  if (vesselLength < UNDER_SIZED_SEPARATE_STOWAGE_MIN_VESSEL_LENGTH_METERS) {
    return false
  }

  const smallPelagicsShare = getSmallPelagicsShare(speciesOnboard)

  return smallPelagicsShare === undefined || smallPelagicsShare <= SMALL_PELAGICS_SHARE_THRESHOLD
}

export function isUnderSizedSeparateRecordingApplicable(vesselLength: number | undefined): boolean {
  return vesselLength === undefined || vesselLength >= UNDER_SIZED_SEPARATE_RECORDING_MIN_VESSEL_LENGTH_METERS
}

export function getSpeciesEISRApplicability(
  speciesOnboard: MissionAction.SpeciesOnboardControl[] | undefined,
  getScipSpeciesTypeFromSpecyCode: ScipSpeciesTypeLookup,
  vesselLength: number | undefined
): SpeciesEISRApplicability {
  return {
    isSeparateStowageOfPreservedSpeciesApplicable: isSeparateStowageOfPreservedSpeciesApplicable(
      speciesOnboard,
      getScipSpeciesTypeFromSpecyCode,
      vesselLength
    ),
    isUnderSizedSeparateRecordingApplicable: isUnderSizedSeparateRecordingApplicable(vesselLength),
    isUnderSizedSeparateStowageApplicable: isUnderSizedSeparateStowageApplicable(speciesOnboard, vesselLength)
  }
}

// Shared by speciesControlCheckRows.tsx and useForceSpeciesEISRFieldsNotApplicable.ts so the
// field-name-to-flag mapping isn't duplicated between them.
export function getApplicabilityByFieldName(applicability: SpeciesEISRApplicability): Record<string, boolean> {
  return {
    separateStowageOfPreservedSpecies: applicability.isSeparateStowageOfPreservedSpeciesApplicable,
    underSizedSeparateRecording: applicability.isUnderSizedSeparateRecordingApplicable,
    underSizedSeparateStowage: applicability.isUnderSizedSeparateStowageApplicable
  }
}
