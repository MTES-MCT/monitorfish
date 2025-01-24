import { SpeciesTypeToSpeciesTypeLabel } from '@features/FleetSegment/constants'

import type { FleetSegment } from '../../../../FleetSegment/types'

export function getTripSegments(
  segments: string[] | undefined,
  segmentsReferential: FleetSegment[] | undefined
): Array<FleetSegment | undefined> {
  if (!segments?.length || !segmentsReferential?.length) {
    return []
  }

  return segments.map(segment => {
    const found = segmentsReferential.find(segmentWithProperties => segmentWithProperties.segment === segment)
    if (!found) {
      return undefined
    }

    return found
  })
}

export function getSegmentInfo(segment: FleetSegment | undefined): string {
  if (!segment) {
    return 'Segment de flotte inconnu'
  }

  const gears = segment.gears?.length ? segment.gears.join(', ') : 'aucun'
  const faoAreas = segment.faoAreas?.length ? segment.faoAreas.join(', ') : 'aucune'
  const targetSpecies = segment.targetSpecies?.length ? segment.targetSpecies.join(', ') : 'aucune'
  const percent = segment.minShareOfTargetSpecies ? segment.minShareOfTargetSpecies * 100 : undefined

  return `Zones : ${faoAreas}
Engins : ${gears}
Maillage min. : ${segment.minMesh ? `${segment.minMesh}mm` : 'aucun'}
Maillage max. : ${segment.maxMesh ? `${segment.maxMesh}mm` : 'aucun'}
Majorité d'espèces : ${segment.mainScipSpeciesType ? SpeciesTypeToSpeciesTypeLabel[segment.mainScipSpeciesType] : 'aucun'}
Espèces cibles ${percent ? `(≥ ${percent}% du total des captures) ` : ''}: ${targetSpecies}`
}
