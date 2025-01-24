import { uniq } from 'lodash'

import type { RiskFactor } from '../../../../domain/entities/vessel/riskFactor/types'
import type { Gear } from '../../../../domain/types/Gear'
import type { FleetSegment } from '@features/FleetSegment/types'

export function getTargetSpeciesIncludedInSegments(
  riskFactor: RiskFactor | undefined,
  fleetSegments: FleetSegment[]
): string | undefined {
  if (!riskFactor?.speciesOnboard || !fleetSegments.length) {
    return undefined
  }

  const speciesFromSegments = uniq(fleetSegments.flatMap(fleetSegment => fleetSegment.targetSpecies))
  if (!speciesFromSegments.length) {
    return undefined
  }

  const minShareOfTargetSpecies = fleetSegments.find(
    fleetSegment => !!fleetSegment.minShareOfTargetSpecies
  )?.minShareOfTargetSpecies

  const minShareOfTargetSpeciesText = minShareOfTargetSpecies
    ? ` (≥ ${minShareOfTargetSpecies * 100}% du total des captures)`
    : ''

  const foundSpecies = uniq(riskFactor.speciesOnboard)
    .filter(specy => speciesFromSegments.includes(specy.species))
    .map(specy => specy.species)
    .join(', ')

  return `${foundSpecies}${minShareOfTargetSpeciesText}`
}

export function getGearsWithNames(gearsReferential: Gear[] | undefined, riskFactor: RiskFactor | undefined) {
  if (!riskFactor?.gearOnboard) {
    return undefined
  }

  return riskFactor.gearOnboard.map(gear => {
    const gearName =
      gearsReferential?.find(gearFromReferential => gearFromReferential.code === gear.gear)?.name ?? undefined

    return { ...gear, gearName }
  })
}

export function getFaoZones(riskFactor: RiskFactor | undefined): string | undefined {
  if (!riskFactor?.speciesOnboard) {
    return undefined
  }

  const nextFaoZones = riskFactor.speciesOnboard.map(species => species.faoZone)

  return uniq(nextFaoZones).join(', ')
}
